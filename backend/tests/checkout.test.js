const request = require("supertest");
const app = require("../app");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { connect, clearDatabase, closeDatabase } = require("./utils/mongo");

/**
 * Helper to register a user and return auth token.
 */
const registerUser = async (overrides = {}) => {
  const payload = {
    name: "Checkout User",
    email: overrides.email || "checkout@example.com",
    password: overrides.password || "password123",
  };

  const response = await request(app).post("/api/auth/register").send(payload);
  return {
    token: response.body.token,
    user: response.body.data,
  };
};

/**
 * Helper to create a product for ordering.
 */
const createProduct = async () => {
  return Product.create({
    title: "Test Product",
    description: "Integration test product",
    price: 49.99,
    stock: 50,
    reservedCount: 0,
    category: "test",
    isActive: true,
  });
};

describe("Checkout Flow", () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("registers a user and completes a product purchase", async () => {
    const catalogProduct = await createProduct();
    const { token } = await registerUser();

    const saveResponse = await request(app)
      .post("/api/orders/checkout/save")
      .set("Authorization", `Bearer ${token}`)
      .send({
        step: "shipping",
        data: {
          fullName: "Checkout User",
          addressLine1: "123 Main St",
          city: "New York",
        },
      });

    expect(saveResponse.status).toBe(200);
    expect(saveResponse.body.resumeToken).toBeDefined();

    const resumeResponse = await request(app)
      .get(`/api/orders/checkout/resume?token=${saveResponse.body.resumeToken}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resumeResponse.status).toBe(200);
    expect(resumeResponse.body.step).toBe("shipping");

    const orderResponse = await request(app)
      .post("/api/orders/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            productId: catalogProduct._id.toString(),
            quantity: 2,
          },
        ],
        shippingAddress: {
          fullName: "Checkout User",
          addressLine1: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        paymentMethod: "card",
      });

    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body.success).toBe(true);
    expect(orderResponse.body.data.items).toHaveLength(1);

    const orderId = orderResponse.body.data._id;
    const orderRecord = await Order.findById(orderId).populate("shipment");
    expect(orderRecord).not.toBeNull();
    expect(orderRecord.shipment).not.toBeNull();
  });
});
