const compensationService = require("../../services/compensation");

/**
 * Unit tests for compensation service
 */
describe("Compensation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("retryWithBackoff", () => {
    test("succeeds on first attempt", async () => {
      const fn = jest.fn().mockResolvedValue("success");

      const result = await compensationService.retryWithBackoff(fn);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("retries on failure and succeeds", async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce("success");

      const result = await compensationService.retryWithBackoff(fn, 3, 10);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test("throws error after max retries", async () => {
      const error = new Error("Persistent failure");
      const fn = jest.fn().mockRejectedValue(error);

      await expect(compensationService.retryWithBackoff(fn, 3, 10)).rejects.toThrow(
        "Persistent failure"
      );
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test("respects exponential backoff delay", async () => {
      const startTime = Date.now();
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce("success");

      await compensationService.retryWithBackoff(fn, 3, 100);

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(100);
      expect(elapsed).toBeLessThan(500);
    });
  });

  describe("compensateOrderFailure", () => {
    test("logs compensation attempt", async () => {
      const orderId = "order123";
      const failureStep = "PROCESS_PAYMENT";
      const error = new Error("Payment failed");

      compensationService.releaseInventory = jest.fn().mockResolvedValue(undefined);
      compensationService.refundPayment = jest.fn().mockResolvedValue(undefined);
      compensationService.updateOrderState = jest.fn().mockResolvedValue(undefined);
      compensationService.sendAlert = jest.fn().mockResolvedValue(undefined);
      compensationService.logCriticalFailure = jest.fn().mockResolvedValue(undefined);

      await compensationService.compensateOrderFailure(orderId, failureStep, error);

      expect(console.error).toHaveBeenCalled();
    });

    test("handles compensation errors gracefully", async () => {
      const orderId = "order123";
      const failureStep = "CREATE_ORDER_RECORD";
      const error = new Error("Order creation failed");

      compensationService.releaseInventory = jest.fn().mockRejectedValue(new Error("Release failed"));
      compensationService.logCriticalFailure = jest.fn().mockResolvedValue(undefined);

      await compensationService.compensateOrderFailure(orderId, failureStep, error);

      expect(compensationService.logCriticalFailure).toHaveBeenCalled();
    });
  });

  describe("sleep", () => {
    test("waits for specified duration", async () => {
      const startTime = Date.now();
      await compensationService.sleep(100);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });
});

