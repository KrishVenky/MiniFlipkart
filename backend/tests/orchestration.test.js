const request = require("supertest");
const express = require("express");
const orderRoutes = require("../../routes/orders");

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

describe("Order Orchestration", () => {
  test("POST /api/orders/submit - Create order with idempotency", async () => {
    const idempotencyKey = "test-key-123";
    
    const firstResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", "Bearer token")
      .set("Idempotency-Key", idempotencyKey)
      .send({ items: [], total: 100 });

    const secondResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", "Bearer token")
      .set("Idempotency-Key", idempotencyKey)
      .send({ items: [], total: 100 });

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.message).toContain("already processed");
  });

  test("GET /api/orders/:id/status - Get order status", async () => {
    // Create order first
    const createResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", "Bearer token")
      .send({ items: [], total: 100 });

    const orderId = createResponse.body.data._id;

    const statusResponse = await request(app)
      .get(`/api/orders/${orderId}/status`)
      .set("Authorization", "Bearer token");

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.state).toBeDefined();
  });
});

