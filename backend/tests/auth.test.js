const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("../../routes/auth");
const User = require("../../models/User");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Authentication API", () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/miniflipkart-test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.data.email).toBe("test@example.com");
    });

    test("should reject registration with invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "invalid-email",
          password: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should reject registration with short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "12345",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should reject duplicate email registration", async () => {
      // Create first user
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "First User",
          email: "test@example.com",
          password: "password123",
        });

      // Try to register again with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Second User",
          email: "test@example.com",
          password: "password456",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });
    });

    test("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test("should reject login with invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });

    test("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });
  });
});

