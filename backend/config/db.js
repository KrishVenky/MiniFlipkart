const mongoose = require("mongoose");

/**
 * Connect to MongoDB using mongoose.
 * @param {string} [uri] - Optional connection string override.
 * @returns {Promise<typeof import("mongoose")>} Active mongoose connection.
 */
const connectDB = async (uri) => {
  const connectionUri = uri || process.env.MONGODB_URI;

  if (!connectionUri) {
    throw new Error("MONGODB_URI is not defined.");
  }

  const connection = await mongoose.connect(connectionUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

module.exports = connectDB;

