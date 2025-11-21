const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: String,
});

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  carrier: {
    type: String,
    enum: ["fedex", "ups", "usps", "dhl"],
    required: true,
  },
  carrierId: {
    type: String,
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_transit", "out_for_delivery", "delivered", "exception"],
    default: "pending",
  },
  currentLocation: {
    type: String,
  },
  timeline: [timelineEventSchema],
  proofOfDelivery: {
    signature: String,
    signedBy: String,
    signedAt: Date,
    imageUrl: String,
  },
  estimatedDelivery: {
    type: Date,
  },
  actualDelivery: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
shipmentSchema.index({ orderId: 1 });
shipmentSchema.index({ userId: 1, createdAt: -1 });
shipmentSchema.index({ trackingNumber: 1 });

module.exports = mongoose.model("Shipment", shipmentSchema);

