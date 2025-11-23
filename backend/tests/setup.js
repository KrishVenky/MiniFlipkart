"use strict";

/**
 * Global Jest setup that hydrates shared environment variables and
 * configures long-running integration tests.
 */
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "1h";
process.env.WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "test-webhook-secret";

// Increase timeout for MongoDB memory server startup.
jest.setTimeout(30000);
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

/**
 * Initialize in-memory MongoDB before the test suite runs.
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  process.env.JWT_SECRET = "test-secret";
  process.env.JWT_EXPIRE = "1h";
});

/**
 * Clean database state between tests to ensure isolation.
 */
afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

/**
 * Tear down Mongo resources after the suite finishes.
 */
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

