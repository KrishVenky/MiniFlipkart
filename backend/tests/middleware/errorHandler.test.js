const { AppError, errorHandler, notFound } = require("../../middleware/errorHandler");

/**
 * Unit tests for error handling middleware
 */
describe("Error Handler Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      originalUrl: "/api/test",
      method: "GET",
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.NODE_ENV = "test";
  });

  describe("AppError", () => {
    test("creates error with message and status code", () => {
      const error = new AppError("Test error", 400);
      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("notFound", () => {
    test("creates 404 error for unknown routes", () => {
      notFound(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain("/api/test");
    });
  });

  describe("errorHandler", () => {
    test("handles AppError correctly", () => {
      const error = new AppError("Custom error", 400);
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Custom error",
      });
    });

    test("handles Mongoose CastError", () => {
      const error = new Error("Cast to ObjectId failed");
      error.name = "CastError";
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Resource not found",
      });
    });

    test("handles Mongoose duplicate key error", () => {
      const error = new Error("Duplicate key");
      error.code = 11000;
      error.keyValue = { email: "test@example.com" };
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Email already exists",
      });
    });

    test("handles Mongoose validation error", () => {
      const error = new Error("Validation failed");
      error.name = "ValidationError";
      error.errors = {
        email: { message: "Email is required" },
        password: { message: "Password is required" },
      };
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Email is required, Password is required",
      });
    });

    test("handles JWT JsonWebTokenError", () => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid token",
      });
    });

    test("handles JWT TokenExpiredError", () => {
      const error = new Error("Token expired");
      error.name = "TokenExpiredError";
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Token expired",
      });
    });

    test("handles generic errors with 500 status", () => {
      const error = new Error("Unexpected error");
      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Unexpected error",
      });
    });

    test("includes stack trace in development mode", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Test error");
      error.stack = "Error stack trace";

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "Test error",
          stack: "Error stack trace",
        })
      );
    });
  });
});

