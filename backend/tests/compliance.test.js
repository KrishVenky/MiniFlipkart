const crypto = require("crypto");
const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");
const tamperDetection = require("../services/tamperDetection");
const auditLogger = require("../middleware/auditLogger");
const { connect, clearDatabase, closeDatabase } = require("./utils/mongo");

const buildChecksum = (entry) => {
  const data = JSON.stringify({
    action: entry.action,
    userId: entry.userId,
    resource: entry.resource,
    timestamp: entry.timestamp,
    metadata: entry.metadata,
  });
  return crypto.createHash("sha256").update(data).digest("hex");
};

const createImmutableAuditLog = async () => {
  const baseEntry = {
    action: "TEST_ACTION",
    userId: new mongoose.Types.ObjectId(),
    resource: "/test",
    method: "GET",
    metadata: { email: "user@example.com" },
    timestamp: new Date(),
  };

  const checksum = buildChecksum(baseEntry);
  return AuditLog.create({ ...baseEntry, checksum });
};

describe("Compliance Tests", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("Audit logs are immutable", async () => {
    const log = await createImmutableAuditLog();

    await expect(
      AuditLog.updateOne({ _id: log._id }, { action: "MODIFIED" })
    ).rejects.toThrow("Audit logs cannot be updated");

    await expect(log.remove()).rejects.toThrow("Audit logs cannot be deleted");
  });

  test("Tamper detection identifies modified logs", async () => {
    const log = await createImmutableAuditLog();

    await AuditLog.collection.updateOne(
      { _id: log._id },
      { $set: { checksum: "tampered_checksum" } }
    );

    const result = await tamperDetection.scanForTampering(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date()
    );

    expect(result.tamperedCount).toBeGreaterThan(0);
    expect(result.tamperedLogs[0]._id.toString()).toBe(log._id.toString());
  });

  test("Sensitive data is redacted in audit logs", () => {
    const metadata = {
      password: "secret123",
      cardNumber: "4111111111111111",
      email: "test@example.com",
      notes: "non-sensitive",
    };

    const redacted = auditLogger.redactSensitiveData(metadata);

    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.cardNumber).toBe("[REDACTED]");
    expect(redacted.email).toBe("[REDACTED]");
    expect(redacted.notes).toBe("non-sensitive");
  });
});
