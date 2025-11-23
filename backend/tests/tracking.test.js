const request = require("supertest");
const app = require("../app");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const { connect, clearDatabase, closeDatabase } = require("./utils/mongo");

const registerAndOrder = async () => {
  const product = await Product.create({
    title: "Tracking Product",
    description: "Tracking scenario product",
    price: 75,
    stock: 25,
    reservedCount: 0,
    isActive: true,
  });

  const registerResponse = await request(app).post("/api/auth/register").send({
    name: "Tracking User",
    email: `tracking+${Date.now()}@example.com`,
    password: "password123",
  });

  const orderResponse = await request(app)
    .post("/api/orders/submit")
    .set("Authorization", `Bearer ${registerResponse.body.token}`)
    .send({
      items: [
        {
          productId: product._id.toString(),
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: "Tracking User",
        addressLine1: "456 Market St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "USA",
      },
      paymentMethod: "card",
    });

  const orderId = orderResponse.body.data._id;
  const shipment = await Shipment.findOne({ orderId });

  return { orderId, shipment };
};

describe("Tracking E2E Tests", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("Webhook updates shipment status", async () => {
    const { shipment } = await registerAndOrder();

    const webhookResponse = await request(app)
      .post("/api/orders/webhook/tracking")
      .set("x-webhook-secret", process.env.WEBHOOK_SECRET)
      .send({
        carrier: "fedex",
        trackingNumber: shipment.trackingNumber,
        status: "in_transit",
        location: "Distribution Center",
        timestamp: new Date().toISOString(),
      });

    expect(webhookResponse.status).toBe(200);

    const updatedShipment = await Shipment.findOne({ trackingNumber: shipment.trackingNumber });
    expect(updatedShipment.status).toBe("in_transit");
    expect(updatedShipment.timeline.length).toBeGreaterThan(1);
  });

  test("Delivery status updates order", async () => {
    const { orderId, shipment } = await registerAndOrder();

    await request(app)
      .post("/api/orders/webhook/tracking")
      .set("x-webhook-secret", process.env.WEBHOOK_SECRET)
      .send({
        carrier: "fedex",
        trackingNumber: shipment.trackingNumber,
        status: "delivered",
        location: "Customer Address",
        timestamp: new Date().toISOString(),
      });

    const updatedOrder = await Order.findById(orderId);
    expect(updatedOrder.state).toBe("delivered");
  });
});
