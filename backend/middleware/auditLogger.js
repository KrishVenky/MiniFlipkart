/**
 * Audit Logging Middleware
 * Captures sensitive operations with structured JSON logs
 */

const AuditLog = require("../models/AuditLog");
const crypto = require("crypto");

class AuditLogger {
  /**
   * Log sensitive operation
   */
  async log(action, req, metadata = {}) {
    try {
      const auditEntry = {
        action,
        userId: req.user?.id || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
        resource: req.originalUrl,
        method: req.method,
        metadata: this.redactSensitiveData(metadata),
        timestamp: new Date(),
        checksum: null, // Will be set after creation
      };

      // Create audit log
      const log = await AuditLog.create(auditEntry);

      // Calculate and store checksum
      log.checksum = this.calculateChecksum(log);
      await log.save();

      return log;
    } catch (error) {
      console.error("[AUDIT_LOG] Failed to log:", error);
      // Don't throw - audit logging should not break application flow
    }
  }

  /**
   * Redact sensitive data from metadata
   */
  redactSensitiveData(metadata) {
    const redacted = { ...metadata };
    const sensitiveFields = ["password", "cardNumber", "cvv", "ssn", "email"];

    sensitiveFields.forEach((field) => {
      if (redacted[field]) {
        redacted[field] = "[REDACTED]";
      }
    });

    return redacted;
  }

  /**
   * Calculate checksum for tamper detection
   */
  calculateChecksum(log) {
    const data = JSON.stringify({
      action: log.action,
      userId: log.userId,
      resource: log.resource,
      timestamp: log.timestamp,
      metadata: log.metadata,
    });

    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Express middleware
   */
  middleware() {
    return async (req, res, next) => {
      // Log sensitive operations
      const sensitiveActions = ["DELETE", "PUT", "POST"];
      if (sensitiveActions.includes(req.method)) {
        // Log after response
        res.on("finish", async () => {
          if (res.statusCode < 400) {
            await this.log(req.method, req, {
              statusCode: res.statusCode,
              body: req.body,
            });
          }
        });
      }

      next();
    };
  }
}

module.exports = new AuditLogger();

