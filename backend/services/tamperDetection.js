/**
 * Tamper Detection Service
 * Verifies checksums and detects tampering
 */

const AuditLog = require("../models/AuditLog");
const crypto = require("crypto");

class TamperDetectionService {
  /**
   * Verify checksum for audit log entry
   */
  verifyChecksum(log) {
    const data = JSON.stringify({
      action: log.action,
      userId: log.userId,
      resource: log.resource,
      timestamp: log.timestamp,
      metadata: log.metadata,
    });

    const calculatedChecksum = crypto.createHash("sha256").update(data).digest("hex");
    return calculatedChecksum === log.checksum;
  }

  /**
   * Scan audit logs for tampering
   */
  async scanForTampering(startDate, endDate) {
    const logs = await AuditLog.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const tamperedLogs = [];
    const alerts = [];

    for (const log of logs) {
      const isValid = this.verifyChecksum(log);
      if (!isValid) {
        tamperedLogs.push(log);
        alerts.push({
          type: "TAMPER_DETECTED",
          logId: log._id,
          severity: "critical",
          timestamp: new Date(),
        });
      }
    }

    if (alerts.length > 0) {
      await this.sendTamperAlerts(alerts);
    }

    return {
      totalScanned: logs.length,
      tamperedCount: tamperedLogs.length,
      tamperedLogs,
    };
  }

  /**
   * Send tamper detection alerts
   */
  async sendTamperAlerts(alerts) {
    console.error("[TAMPER_DETECTION] Critical: Tampering detected!", {
      count: alerts.length,
      alerts,
      timestamp: new Date(),
    });

    // Send to security team
    await this.notifySecurityTeam(alerts);

    // Log to separate security log
    await this.logSecurityEvent({
      type: "TAMPER_DETECTED",
      alertCount: alerts.length,
      timestamp: new Date(),
    });
  }

  async notifySecurityTeam(alerts) {
    // Implementation: Send email/SMS to security team
  }

  async logSecurityEvent(event) {
    // Implementation: Log to separate security event log
  }
}

module.exports = new TamperDetectionService();

