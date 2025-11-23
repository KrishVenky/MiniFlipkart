const request = require("supertest");
const app = require("../app");
const Product = require("../models/Product");
const { connect, clearDatabase, closeDatabase } = require("./utils/mongo");

const bootstrapOrderPayload = async () => {
  const product = await Product.create({
    title: "Idempotent Product",
    description: "Order orchestration spec product",
    price: 25,
    stock: 100,
    reservedCount: 0,
    isActive: true,
  });

  const registerResponse = await request(app).post("/api/auth/register").send({
    name: "Orchestration User",
    email: "orchestration@example.com",
    password: "password123",
  });

  return {
    token: registerResponse.body.token,
    productId: product._id.toString(),
  };
};

const buildOrderBody = (productId) => ({
  items: [
    {
      productId,
      quantity: 1,
    },
  ],
  shippingAddress: {
    fullName: "Orchestration User",
    addressLine1: "1 Pipe Lane",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    country: "USA",
  },
  paymentMethod: "card",
});

describe("Order Orchestration", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("enforces idempotent submissions", async () => {
    const { token, productId } = await bootstrapOrderPayload();
    const idempotencyKey = "test-key-123";
    const orderBody = buildOrderBody(productId);

    const firstResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", idempotencyKey)
      .send(orderBody);

    const secondResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", `Bearer ${token}`)
      .set("Idempotency-Key", idempotencyKey)
      .send(orderBody);

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.message).toContain("already processed");
  });

  test("retrieves order status for owner", async () => {
    const { token, productId } = await bootstrapOrderPayload();
    const createResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", `Bearer ${token}`)
      .send(buildOrderBody(productId));

    const orderId = createResponse.body.data._id;
    const statusResponse = await request(app)
      .get(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${token}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.state).toBeDefined();
  });
});

