/**
 * Inventory Sync Worker
 * Syncs stock levels with retry/backoff policy
 */

const Product = require("../models/Product");
const axios = require("axios");

class InventorySyncWorker {
  constructor() {
    this.maxRetries = 3;
    this.initialBackoff = 1000; // 1 second
  }

  /**
   * Sync inventory with exponential backoff
   */
  async syncInventory() {
    console.log("[INVENTORY_SYNC] Starting sync...");

    try {
      const products = await Product.find({ isActive: true });

      for (const product of products) {
        await this.syncProduct(product);
      }

      console.log("[INVENTORY_SYNC] Sync completed successfully");
    } catch (error) {
      console.error("[INVENTORY_SYNC] Sync failed:", error);
      throw error;
    }
  }

  /**
   * Sync single product with retry
   */
  async syncProduct(product, retryCount = 0) {
    try {
      // Call external inventory API
      const response = await axios.get(`https://external-api.com/inventory/${product.externalId}`, {
        timeout: 5000,
      });

      const newStock = response.data.stock;

      // Update product stock
      product.stock = newStock;
      product.lastSyncedAt = new Date();
      await product.save();

      // Check for low stock alerts
      if (newStock < 10) {
        await this.triggerLowStockAlert(product, newStock);
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const backoff = this.initialBackoff * Math.pow(2, retryCount);
        console.log(`[INVENTORY_SYNC] Retrying ${product._id} after ${backoff}ms`);
        await this.sleep(backoff);
        return this.syncProduct(product, retryCount + 1);
      }
      throw error;
    }
  }

  async triggerLowStockAlert(product, stock) {
    // Implementation for alerting
    console.warn(`[INVENTORY_SYNC] Low stock alert: ${product.title} - ${stock} units`);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run if executed directly
if (require.main === module) {
  const worker = new InventorySyncWorker();
  worker.syncInventory()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = InventorySyncWorker;

