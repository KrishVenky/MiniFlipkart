const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/User");
const { protect, sendTokenResponse } = require("../../middleware/auth");
const { AppError } = require("../../middleware/errorHandler");
const { connect, clearDatabase, closeDatabase } = require("../utils/mongo");

/**
 * Unit tests for authentication middleware
 */
describe("Auth Middleware", () => {
  let user;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    user = await User.create({
      name: "Test User",
      email: `test+${Date.now()}@example.com`,
      password: "password123",
    });

    mockReq = {
      headers: {},
      user: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("sendTokenResponse", () => {
    test("sends token response with user data", () => {
      sendTokenResponse(user, 201, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        token: expect.any(String),
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      const token = mockRes.json.mock.calls[0][0].token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(user._id.toString());
    });
  });

  describe("protect middleware", () => {
    test("allows access with valid token", async () => {
      const token = user.getSignedJwtToken();
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id.toString()).toBe(user._id.toString());
      expect(mockReq.user.email).toBe(user.email);
      expect(mockReq.user.role).toBe(user.role);
    });

    test("rejects request without authorization header", async () => {
      mockReq.headers.authorization = undefined;

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    test("rejects request with invalid token format", async () => {
      mockReq.headers.authorization = "InvalidFormat token";

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });

    test("rejects request with invalid token", async () => {
      mockReq.headers.authorization = "Bearer invalid-token-here";

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeDefined();
    });

    test("rejects request when user not found", async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: nonExistentUserId }, process.env.JWT_SECRET);
      mockReq.headers.authorization = `Bearer ${token}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
    });
  });
});

