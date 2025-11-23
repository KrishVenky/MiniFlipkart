const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const orderOrchestration = require("../services/orderOrchestration");
const { connect, clearDatabase } = require("./utils/mongo");

describe("OrderOrchestrationService", () => {
  let product;
  const shippingAddress = {
    fullName: "Test User",
    addressLine1: "123 Test St",
    city: "Testville",
    state: "TS",
    zipCode: "12345",
    country: "USA",
    phone: "1234567890",
  };

  beforeAll(async () => {
    await connect();
  });

  beforeEach(async () => {
    await clearDatabase();
    product = await Product.create({
      title: "Test Product",
      description: "Sample",
      price: 99.99,
      stock: 10,
      reservedCount: 0,
      isActive: true,
    });
  });

  test("creates order when inventory is available", async () => {
    const userId = new mongoose.Types.ObjectId();
    const orderPayload = {
      items: [{ productId: product._id, quantity: 2 }],
      shippingAddress,
      paymentMethod: "card",
    };

    const order = await orderOrchestration.createOrder(orderPayload, userId);

    expect(order.total).toBeCloseTo(199.98);
    expect(order.state).toBe("processing");
    expect(order.items[0].quantity).toBe(2);
  });

  test("throws error when stock is insufficient", async () => {
    const userId = new mongoose.Types.ObjectId();
    const orderPayload = {
      items: [{ productId: product._id, quantity: 20 }],
      shippingAddress,
      paymentMethod: "card",
    };

    await expect(orderOrchestration.createOrder(orderPayload, userId)).rejects.toThrow(
      "Insufficient stock for product"
    );
  });
});

