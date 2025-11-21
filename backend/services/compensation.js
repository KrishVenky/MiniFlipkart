/**
 * Compensation and retry helpers for order orchestration
 */

class CompensationService {
  /**
   * Compensate for failed order creation
   */
  async compensateOrderFailure(orderId, failureStep, error) {
    console.error(`[COMPENSATION] Order ${orderId} failed at ${failureStep}:`, error);

    try {
      // Release reserved inventory
      await this.releaseInventory(orderId);

      // Refund payment if processed
      if (failureStep === "CREATE_ORDER_RECORD" || failureStep === "SEND_CONFIRMATION") {
        await this.refundPayment(orderId);
      }

      // Update order state
      await this.updateOrderState(orderId, "cancelled");

      // Send alert
      await this.sendAlert({
        type: "ORDER_FAILURE",
        orderId,
        failureStep,
        error: error.message,
      });
    } catch (compensationError) {
      console.error("[COMPENSATION] Compensation failed:", compensationError);
      // Critical: Log for manual intervention
      await this.logCriticalFailure(orderId, compensationError);
    }
  }

  /**
   * Retry with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;

        const delay = initialDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
      }
    }
  }

  async releaseInventory(orderId) {
    // Implementation
  }

  async refundPayment(orderId) {
    // Implementation
  }

  async updateOrderState(orderId, state) {
    // Implementation
  }

  async sendAlert(alertData) {
    // Implementation
  }

  async logCriticalFailure(orderId, error) {
    // Implementation
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new CompensationService();

