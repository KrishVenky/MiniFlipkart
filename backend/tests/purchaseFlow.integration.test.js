const request = require("supertest");
const app = require("../app");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const User = require("../models/User");
const { connect, clearDatabase, closeDatabase } = require("./utils/mongo");

/**
 * Integration test: Complete purchase flow from registration to delivery
 * This test validates the entire user journey:
 * 1. User registration
 * 2. Product browsing
 * 3. Order creation
 * 4. Order processing
 * 5. Shipment creation
 * 6. Tracking updates
 * 7. Delivery completion
 */
describe("Complete Purchase Flow Integration", () => {
  let authToken;
  let userId;
  let product;
  let orderId;
  let shipmentId;

  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("register user and buy product to completion", async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Complete Buyer",
        email: `complete+${Date.now()}@example.com`,
        password: "password123",
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.token).toBeDefined();
    expect(registerResponse.body.data.email).toBeDefined();

    authToken = registerResponse.body.token;
    userId = registerResponse.body.data.id;

    // Verify user was created in database
    const user = await User.findById(userId);
    expect(user).toBeDefined();
    expect(user.email).toBe(registerResponse.body.data.email);

    // Step 2: Create a product to purchase
    product = await Product.create({
      title: "Premium Laptop Sleeve",
      description: "High-quality protective sleeve for laptops",
      price: 79.99,
      stock: 10,
      reservedCount: 0,
      isActive: true,
    });

    expect(product._id).toBeDefined();
    expect(product.stock).toBe(10);

    // Step 3: Browse products (verify product is available)
    const productsResponse = await request(app).get("/api/products");
    expect(productsResponse.status).toBe(200);
    expect(productsResponse.body.success).toBe(true);
    const foundProduct = productsResponse.body.data.find(
      (p) => p._id.toString() === product._id.toString()
    );
    expect(foundProduct).toBeDefined();

    // Step 4: Submit order
    const orderResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        items: [
          {
            productId: product._id.toString(),
            quantity: 2,
          },
        ],
        shippingAddress: {
          fullName: "Complete Buyer",
          addressLine1: "123 Commerce Street",
          city: "Shop City",
          state: "CA",
          zipCode: "90001",
          country: "USA",
          phone: "1234567890",
        },
        paymentMethod: "card",
      });

    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body.success).toBe(true);
    expect(orderResponse.body.data.total).toBeCloseTo(159.98); // 79.99 * 2
    expect(orderResponse.body.data.state).toBe("processing");
    expect(orderResponse.body.data.items).toHaveLength(1);
    expect(orderResponse.body.data.items[0].quantity).toBe(2);

    orderId = orderResponse.body.data._id;

    // Verify order was created in database
    const order = await Order.findById(orderId);
    expect(order).toBeDefined();
    expect(order.userId.toString()).toBe(userId);
    expect(order.state).toBe("processing");
    expect(order.total).toBeCloseTo(159.98);

    // Verify inventory was reserved
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.reservedCount).toBe(2);
    expect(updatedProduct.availableStock).toBe(8); // 10 - 2

    // Step 5: Verify shipment was created
    const shipment = await Shipment.findOne({ orderId });
    expect(shipment).toBeDefined();
    expect(shipment.trackingNumber).toBeDefined();
    expect(shipment.carrier).toBe("fedex");
    expect(shipment.status).toBe("pending");
    expect(shipment.timeline).toHaveLength(1);

    shipmentId = shipment._id;

    // Step 6: Check order status
    const statusResponse = await request(app)
      .get(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.success).toBe(true);
    expect(statusResponse.body.data.state).toBe("processing");

    // Step 7: Check tracking information
    const trackingResponse = await request(app)
      .get(`/api/orders/${orderId}/tracking`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(trackingResponse.status).toBe(200);
    expect(trackingResponse.body.success).toBe(true);
    expect(trackingResponse.body.data.trackingNumber).toBe(shipment.trackingNumber);
    expect(trackingResponse.body.data.status).toBe("pending");

    // Step 8: Simulate shipment in transit
    const transitResponse = await request(app)
      .post("/api/orders/webhook/tracking")
      .set("x-webhook-secret", process.env.WEBHOOK_SECRET || "test-webhook-secret")
      .send({
        carrier: "fedex",
        trackingNumber: shipment.trackingNumber,
        status: "in_transit",
        location: "Distribution Center",
        timestamp: new Date().toISOString(),
      });

    expect(transitResponse.status).toBe(200);

    const updatedShipment = await Shipment.findById(shipmentId);
    expect(updatedShipment.status).toBe("in_transit");
    expect(updatedShipment.timeline.length).toBeGreaterThan(1);

    // Step 9: Simulate delivery
    const deliveryResponse = await request(app)
      .post("/api/orders/webhook/tracking")
      .set("x-webhook-secret", process.env.WEBHOOK_SECRET || "test-webhook-secret")
      .send({
        carrier: "fedex",
        trackingNumber: shipment.trackingNumber,
        status: "delivered",
        location: "Customer Address",
        timestamp: new Date().toISOString(),
      });

    expect(deliveryResponse.status).toBe(200);

    // Step 10: Verify order is marked as delivered
    const finalOrder = await Order.findById(orderId);
    expect(finalOrder.state).toBe("delivered");

    const finalShipment = await Shipment.findById(shipmentId);
    expect(finalShipment.status).toBe("delivered");
    expect(finalShipment.timeline.length).toBeGreaterThan(2);

    // Step 11: Verify final order status via API
    const finalStatusResponse = await request(app)
      .get(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(finalStatusResponse.status).toBe(200);
    expect(finalStatusResponse.body.data.state).toBe("delivered");

    // Step 12: Verify final tracking status
    const finalTrackingResponse = await request(app)
      .get(`/api/orders/${orderId}/tracking`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(finalTrackingResponse.status).toBe(200);
    expect(finalTrackingResponse.body.data.status).toBe("delivered");

    // Complete flow verification
    expect(user).toBeDefined();
    expect(order).toBeDefined();
    expect(finalOrder.state).toBe("delivered");
    expect(finalShipment.status).toBe("delivered");
  });
});
