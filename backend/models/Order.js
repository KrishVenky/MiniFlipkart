const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  total: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
    index: true,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shipment",
    default: null,
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  auditRefs: [{
    action: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: mongoose.Schema.Types.Mixed,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ state: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

