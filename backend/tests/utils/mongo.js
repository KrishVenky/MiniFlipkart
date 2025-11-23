"use strict";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoInstance;

/**
 * Establishes an in-memory MongoDB connection for isolated tests.
 * Reuses existing connection if mongoose is already connected.
 */
const connect = async () => {
  // Check if mongoose is already connected (e.g., from global setup.js)
  if (mongoose.connection.readyState === 1) {
    return; // Already connected, reuse existing connection
  }

  // Only create new connection if not already connected
  if (!mongoInstance) {
    mongoInstance = await MongoMemoryServer.create();
    const uri = mongoInstance.getUri();

    await mongoose.connect(uri, {
      dbName: "miniflipkart_tests",
    });
  }
};

/**
 * Drops all data between tests to keep them hermetic.
 */
const clearDatabase = async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

/**
 * Tears down the in-memory database.
 * Only closes if this utility created the connection.
 */
const closeDatabase = async () => {
  // Only close if we created the connection (mongoInstance exists)
  // If connection was created by global setup.js, let it handle cleanup
  if (mongoInstance && mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoInstance.stop();
    mongoInstance = null;
  }
};

module.exports = {
  connect,
  clearDatabase,
  closeDatabase,
};

