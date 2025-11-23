const tamperDetectionService = require("../../services/tamperDetection");
const AuditLog = require("../../models/AuditLog");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { connect, clearDatabase, closeDatabase } = require("../utils/mongo");

/**
 * Unit tests for tamper detection service
 */
describe("Tamper Detection Service", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe("verifyChecksum", () => {
    test("verifies valid checksum", () => {
      const logData = {
        action: "CREATE_ORDER",
        userId: new mongoose.Types.ObjectId(),
        resource: "Order",
        timestamp: new Date(),
        metadata: { orderId: "123" },
      };

      const data = JSON.stringify({
        action: logData.action,
        userId: logData.userId,
        resource: logData.resource,
        timestamp: logData.timestamp,
        metadata: logData.metadata,
      });

      const checksum = crypto.createHash("sha256").update(data).digest("hex");

      const log = {
        ...logData,
        checksum,
      };

      const isValid = tamperDetectionService.verifyChecksum(log);
      expect(isValid).toBe(true);
    });

    test("detects tampered checksum", () => {
      const logData = {
        action: "CREATE_ORDER",
        userId: new mongoose.Types.ObjectId(),
        resource: "Order",
        timestamp: new Date(),
        metadata: { orderId: "123" },
      };

      const log = {
        ...logData,
        checksum: "tampered-checksum",
      };

      const isValid = tamperDetectionService.verifyChecksum(log);
      expect(isValid).toBe(false);
    });

    test("detects tampering when metadata is changed", () => {
      const logData = {
        action: "CREATE_ORDER",
        userId: new mongoose.Types.ObjectId(),
        resource: "Order",
        timestamp: new Date(),
        metadata: { orderId: "123" },
      };

      const data = JSON.stringify({
        action: logData.action,
        userId: logData.userId,
        resource: logData.resource,
        timestamp: logData.timestamp,
        metadata: logData.metadata,
      });

      const checksum = crypto.createHash("sha256").update(data).digest("hex");

      const log = {
        ...logData,
        metadata: { orderId: "456" },
        checksum,
      };

      const isValid = tamperDetectionService.verifyChecksum(log);
      expect(isValid).toBe(false);
    });
  });

  describe("scanForTampering", () => {
    test("scans logs and detects tampering", async () => {
      const userId = new mongoose.Types.ObjectId();
      const validLogData = {
        action: "CREATE_ORDER",
        userId,
        resource: "Order",
        timestamp: new Date(),
        metadata: { orderId: "123" },
      };

      const data = JSON.stringify({
        action: validLogData.action,
        userId: validLogData.userId,
        resource: validLogData.resource,
        timestamp: validLogData.timestamp,
        metadata: validLogData.metadata,
      });

      const validChecksum = crypto.createHash("sha256").update(data).digest("hex");

      await AuditLog.create({
        ...validLogData,
        checksum: validChecksum,
      });

      await AuditLog.create({
        ...validLogData,
        checksum: "tampered-checksum",
      });

      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();

      tamperDetectionService.sendTamperAlerts = jest.fn().mockResolvedValue(undefined);

      const result = await tamperDetectionService.scanForTampering(startDate, endDate);

      expect(result.totalScanned).toBe(2);
      expect(result.tamperedCount).toBe(1);
      expect(result.tamperedLogs).toHaveLength(1);
      expect(tamperDetectionService.sendTamperAlerts).toHaveBeenCalled();
    });

    test("returns empty results when no tampering detected", async () => {
      const userId = new mongoose.Types.ObjectId();
      const logData = {
        action: "CREATE_ORDER",
        userId,
        resource: "Order",
        timestamp: new Date(),
        metadata: { orderId: "123" },
      };

      const data = JSON.stringify({
        action: logData.action,
        userId: logData.userId,
        resource: logData.resource,
        timestamp: logData.timestamp,
        metadata: logData.metadata,
      });

      const checksum = crypto.createHash("sha256").update(data).digest("hex");

      await AuditLog.create({
        ...logData,
        checksum,
      });

      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();

      tamperDetectionService.sendTamperAlerts = jest.fn().mockResolvedValue(undefined);

      const result = await tamperDetectionService.scanForTampering(startDate, endDate);

      expect(result.totalScanned).toBe(1);
      expect(result.tamperedCount).toBe(0);
      expect(result.tamperedLogs).toHaveLength(0);
      expect(tamperDetectionService.sendTamperAlerts).not.toHaveBeenCalled();
    });
  });
});

