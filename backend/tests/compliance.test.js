const request = require("supertest");
const express = require("express");
const auditRoutes = require("../../routes/audit");
const tamperDetection = require("../../services/tamperDetection");

const app = express();
app.use(express.json());
app.use("/api/audit", auditRoutes);

describe("Compliance Tests", () => {
  test("Audit logs are immutable", async () => {
    // Create audit log
    const log = await AuditLog.create({
      action: "TEST_ACTION",
      resource: "/test",
      method: "GET",
      checksum: "test",
    });

    // Try to update (should fail)
    try {
      await AuditLog.updateOne({ _id: log._id }, { action: "MODIFIED" });
      fail("Should not allow updates");
    } catch (error) {
      expect(error.message).toContain("immutable");
    }

    // Try to delete (should fail)
    try {
      await log.remove();
      fail("Should not allow deletion");
    } catch (error) {
      expect(error.message).toContain("cannot be deleted");
    }
  });

  test("Tamper detection identifies modified logs", async () => {
    const log = await AuditLog.create({
      action: "TEST_ACTION",
      resource: "/test",
      method: "GET",
      checksum: "correct_checksum",
    });

    // Manually modify checksum (simulating tampering)
    await AuditLog.collection.updateOne(
      { _id: log._id },
      { $set: { checksum: "tampered_checksum" } }
    );

    const result = await tamperDetection.scanForTampering(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date()
    );

    expect(result.tamperedCount).toBeGreaterThan(0);
  });

  test("Sensitive data is redacted in audit logs", async () => {
    const auditLogger = require("../../middleware/auditLogger");
    const metadata = {
      password: "secret123",
      cardNumber: "4111111111111111",
      email: "test@example.com",
    };

    const redacted = auditLogger.redactSensitiveData(metadata);

    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.cardNumber).toBe("[REDACTED]");
    expect(redacted.email).toBe("[REDACTED]");
  });
});

