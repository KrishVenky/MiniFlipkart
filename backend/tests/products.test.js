const request = require("supertest");
const express = require("express");
const productRoutes = require("../../routes/products");

const app = express();
app.use(express.json());
app.use("/api/products", productRoutes);

describe("Product API - Filter Permutations", () => {
  test("GET /api/products with category filter", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({ category: "electronics" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("GET /api/products with price range", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({ minPrice: 10, maxPrice: 100 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("GET /api/products with invalid price range", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({ minPrice: 100, maxPrice: 10 });

    expect(response.status).toBe(400);
  });

  test("GET /api/products with search query", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({ search: "laptop" });

    expect(response.status).toBe(200);
  });

  test("GET /api/products with pagination", async () => {
    const response = await request(app)
      .get("/api/products")
      .query({ page: 2, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.count).toBeLessThanOrEqual(10);
  });
});

