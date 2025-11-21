const request = require("supertest");
const express = require("express");
const orderRoutes = require("../../routes/orders");

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

describe("Tracking E2E Tests", () => {
  test("Webhook updates shipment status", async () => {
    // Create order and shipment first
    const order = await createTestOrder();
    const shipment = await createTestShipment(order._id);

    // Simulate carrier webhook
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

    // Verify shipment updated
    const updatedShipment = await Shipment.findOne({ trackingNumber: shipment.trackingNumber });
    expect(updatedShipment.status).toBe("in_transit");
    expect(updatedShipment.timeline.length).toBeGreaterThan(0);
  });

  test("Delivery status updates order", async () => {
    const order = await createTestOrder();
    const shipment = await createTestShipment(order._id);

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

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.state).toBe("delivered");
  });
});

