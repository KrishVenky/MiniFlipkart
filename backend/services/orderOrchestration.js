const Product = require("../models/Product");
const Order = require("../models/Order");
const { AppError } = require("../middleware/errorHandler");

/**
 * Order Orchestration Service
 * Separates orchestration logic from controllers
 */

class OrderOrchestrationService {
  constructor() {
    this.tracingEnabled = process.env.ENABLE_TRACING === "true";
  }

  /**
   * Trace orchestration step
   */
  trace(step, data) {
    if (this.tracingEnabled) {
      console.log(`[ORCHESTRATION] ${step}:`, {
        timestamp: new Date().toISOString(),
        ...data,
      });
    }
  }

  /**
   * Orchestrate order creation
   */
  async createOrder(orderData, userId) {
    this.trace("START_ORDER_CREATION", { userId, orderData });

    try {
      if (!orderData.shippingAddress) {
        throw new AppError("Shipping address is required", 400);
      }

      if (!orderData.paymentMethod) {
        throw new AppError("Payment method is required", 400);
      }

      // Step 1: Validate inventory
      this.trace("VALIDATE_INVENTORY", { items: orderData.items });
      const inventoryContext = await this.validateInventory(orderData.items);

      // Step 2: Reserve inventory
      this.trace("RESERVE_INVENTORY", { items: orderData.items });
      await this.reserveInventory(orderData.items);

      // Step 3: Process payment
      this.trace("PROCESS_PAYMENT", { amount: inventoryContext.total });
      const paymentResult = await this.processPayment(orderData.paymentMethod, inventoryContext.total);

      // Step 4: Create order record
      this.trace("CREATE_ORDER_RECORD", { userId });
      const order = await this.createOrderRecord(orderData, userId, paymentResult, inventoryContext);

      // Step 5: Send confirmation
      this.trace("SEND_CONFIRMATION", { orderId: order._id });
      await this.sendConfirmation(userId, order);

      this.trace("ORDER_CREATION_COMPLETE", { orderId: order._id });
      return order;
    } catch (error) {
      this.trace("ORDER_CREATION_FAILED", { error: error.message });
      throw error;
    }
  }

  /**
   * Ensure all requested items have sufficient stock.
   */
  async validateInventory(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("Order items are required", 400);
    }

    const products = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new AppError("Product not available", 400);
      }

      if (item.quantity > product.availableStock) {
        throw new AppError("Insufficient stock for product", 400);
      }

      total += product.price * item.quantity;
      products.push({
        product,
        quantity: item.quantity,
        price: product.price,
      });
    }

    return { products, total };
  }

  /**
   * Reserve inventory by incrementing the reserved count.
   */
  async reserveInventory(items) {
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { reservedCount: item.quantity },
      });
    }
  }

  /**
   * Mock payment processing logic.
   */
  async processPayment(paymentMethod, amount) {
    if (!paymentMethod) {
      throw new AppError("Payment method is required", 400);
    }

    if (amount <= 0) {
      throw new AppError("Invalid payment amount", 400);
    }

    return {
      status: "authorized",
      transactionId: `txn_${Date.now()}`,
      amount,
      method: paymentMethod,
    };
  }

  /**
   * Persist a new order record.
   */
  async createOrderRecord(orderData, userId, paymentResult, inventoryContext) {
    const order = await Order.create({
      userId,
      items: inventoryContext.products.map(({ product, quantity, price }) => ({
        productId: product._id,
        quantity,
        price,
      })),
      total: inventoryContext.total,
      state: "processing",
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      auditRefs: [
        {
          action: "payment_authorized",
          userId,
          metadata: paymentResult,
        },
      ],
    });

    return order;
  }

  /**
   * No-op confirmation sender for demo purposes.
   */
  async sendConfirmation(userId, order) {
    this.trace("EMAIL_DISPATCH", { userId, orderId: order._id });
  }
}

module.exports = new OrderOrchestrationService();

