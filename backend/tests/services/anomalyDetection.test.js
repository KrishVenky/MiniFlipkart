const anomalyDetectionService = require("../../services/anomalyDetection");

/**
 * Unit tests for anomaly detection service
 */
describe("Anomaly Detection Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    anomalyDetectionService.alertThrottle.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("detectAnomaly", () => {
    test("detects percentage delta anomaly", async () => {
      anomalyDetectionService.handleAnomaly = jest.fn().mockResolvedValue(undefined);

      const anomalies = await anomalyDetectionService.detectAnomaly("product1", 100, 160);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe("PERCENTAGE_DELTA");
      expect(anomalies[0].severity).toBe("high");
      expect(anomalyDetectionService.handleAnomaly).toHaveBeenCalled();
    });

    test("detects absolute delta anomaly", async () => {
      anomalyDetectionService.handleAnomaly = jest.fn().mockResolvedValue(undefined);

      const anomalies = await anomalyDetectionService.detectAnomaly("product1", 50, 160);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe("ABSOLUTE_DELTA");
      expect(anomalies[0].severity).toBe("high");
      expect(anomalyDetectionService.handleAnomaly).toHaveBeenCalled();
    });

    test("detects both percentage and absolute delta anomalies", async () => {
      anomalyDetectionService.handleAnomaly = jest.fn().mockResolvedValue(undefined);

      const anomalies = await anomalyDetectionService.detectAnomaly("product1", 100, 200);

      expect(anomalies.length).toBeGreaterThanOrEqual(1);
      expect(anomalyDetectionService.handleAnomaly).toHaveBeenCalled();
    });

    test("returns empty array for normal stock changes", async () => {
      anomalyDetectionService.handleAnomaly = jest.fn().mockResolvedValue(undefined);

      const anomalies = await anomalyDetectionService.detectAnomaly("product1", 100, 120);

      expect(anomalies).toHaveLength(0);
      expect(anomalyDetectionService.handleAnomaly).not.toHaveBeenCalled();
    });

    test("handles zero initial stock", async () => {
      anomalyDetectionService.handleAnomaly = jest.fn().mockResolvedValue(undefined);

      const anomalies = await anomalyDetectionService.detectAnomaly("product1", 0, 50);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].type).toBe("PERCENTAGE_DELTA");
    });

    test("handles negative stock changes", async () => {
      anomalyDetectionService.handleAnomaly = jest.fn().mockResolvedValue(undefined);

      const anomalies = await anomalyDetectionService.detectAnomaly("product1", 100, 40);

      expect(anomalies.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("handleAnomaly", () => {
    test("sends alert for detected anomaly", async () => {
      anomalyDetectionService.sendAlert = jest.fn().mockResolvedValue(undefined);

      const anomalies = [
        {
          type: "PERCENTAGE_DELTA",
          severity: "high",
          message: "Stock changed by 60%",
        },
      ];

      await anomalyDetectionService.handleAnomaly("product1", anomalies, {
        oldStock: 100,
        newStock: 160,
      });

      expect(anomalyDetectionService.sendAlert).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    test("throttles alerts for same product", async () => {
      anomalyDetectionService.sendAlert = jest.fn().mockResolvedValue(undefined);

      const anomalies = [
        {
          type: "PERCENTAGE_DELTA",
          severity: "high",
          message: "Stock changed by 60%",
        },
      ];

      await anomalyDetectionService.handleAnomaly("product1", anomalies, {
        oldStock: 100,
        newStock: 160,
      });

      await anomalyDetectionService.handleAnomaly("product1", anomalies, {
        oldStock: 100,
        newStock: 160,
      });

      expect(anomalyDetectionService.sendAlert).toHaveBeenCalledTimes(1);
    });

    test("allows alerts for different products", async () => {
      anomalyDetectionService.sendAlert = jest.fn().mockResolvedValue(undefined);

      const anomalies = [
        {
          type: "PERCENTAGE_DELTA",
          severity: "high",
          message: "Stock changed by 60%",
        },
      ];

      await anomalyDetectionService.handleAnomaly("product1", anomalies, {
        oldStock: 100,
        newStock: 160,
      });

      await anomalyDetectionService.handleAnomaly("product2", anomalies, {
        oldStock: 100,
        newStock: 160,
      });

      expect(anomalyDetectionService.sendAlert).toHaveBeenCalledTimes(2);
    });
  });
});

