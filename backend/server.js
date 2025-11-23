"use strict";

const dotenv = require("dotenv");
const { createApp } = require("./app");
const connectDB = require("./config/db");

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap the HTTP server after establishing the database connection.
 */
const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[MiniFlipkart] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[MiniFlipkart] Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

