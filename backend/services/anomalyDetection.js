/**
 * Anomaly Detection Service
 * Detects unusual stock level changes
 */

class AnomalyDetectionService {
  constructor() {
    this.thresholds = {
      deltaPercentage: 50, // 50% change triggers alert
      absoluteDelta: 100, // 100 units change triggers alert
    };
    this.alertThrottle = new Map(); // Prevent spam
  }

  /**
   * Detect anomalies in stock changes
   */
  async detectAnomaly(productId, oldStock, newStock) {
    const delta = Math.abs(newStock - oldStock);
    const deltaPercentage = oldStock > 0 ? (delta / oldStock) * 100 : 100;

    const anomalies = [];

    // Check percentage change
    if (deltaPercentage > this.thresholds.deltaPercentage) {
      anomalies.push({
        type: "PERCENTAGE_DELTA",
        severity: "high",
        message: `Stock changed by ${deltaPercentage.toFixed(2)}%`,
      });
    }

    // Check absolute change
    if (delta > this.thresholds.absoluteDelta) {
      anomalies.push({
        type: "ABSOLUTE_DELTA",
        severity: "high",
        message: `Stock changed by ${delta} units`,
      });
    }

    if (anomalies.length > 0) {
      await this.handleAnomaly(productId, anomalies, { oldStock, newStock });
    }

    return anomalies;
  }

  /**
   * Handle detected anomaly with throttling
   */
  async handleAnomaly(productId, anomalies, context) {
    const key = `${productId}-${Date.now()}`;
    const lastAlert = this.alertThrottle.get(productId);

    // Throttle: max 1 alert per 5 minutes per product
    if (lastAlert && Date.now() - lastAlert < 5 * 60 * 1000) {
      return;
    }

    this.alertThrottle.set(productId, Date.now());

    // Log anomaly
    console.warn("[ANOMALY_DETECTION]", {
      productId,
      anomalies,
      context,
      timestamp: new Date(),
    });

    // Send alert
    await this.sendAlert({
      productId,
      anomalies,
      context,
    });
  }

  async sendAlert(alertData) {
    // Implementation for alerting channel
    // Could integrate with email, SMS, or monitoring service
  }
}

module.exports = new AnomalyDetectionService();

