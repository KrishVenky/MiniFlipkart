const request = require("supertest");
const express = require("express");
const orderRoutes = require("../../routes/orders");

const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

describe("Checkout Flow", () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup: Create user and get token
    // ... setup code ...
  });

  test("POST /api/orders/checkout/save - Save checkout progress", async () => {
    const response = await request(app)
      .post("/api/orders/checkout/save")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        step: "shipping",
        data: { address: "123 Main St" },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.resumeToken).toBeDefined();
  });

  test("GET /api/orders/checkout/resume - Resume checkout", async () => {
    // First save
    const saveResponse = await request(app)
      .post("/api/orders/checkout/save")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        step: "payment",
        data: { paymentMethod: "card" },
      });

    const resumeToken = saveResponse.body.resumeToken;

    // Then resume
    const resumeResponse = await request(app)
      .get(`/api/orders/checkout/resume?token=${resumeToken}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(resumeResponse.status).toBe(200);
    expect(resumeResponse.body.step).toBe("payment");
  });
});

