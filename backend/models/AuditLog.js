const mongoose = require("mongoose");
const crypto = require("crypto");

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  resource: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  checksum: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
}, {
  timestamps: false, // Don't use mongoose timestamps for immutable logs
});

// Prevent updates and deletes
auditLogSchema.pre("save", function(next) {
  if (this.isNew) {
    // Only allow new documents
    next();
  } else {
    next(new Error("Audit logs are immutable"));
  }
});

auditLogSchema.pre("remove", function(next) {
  next(new Error("Audit logs cannot be deleted"));
});

auditLogSchema.pre("updateOne", function(next) {
  next(new Error("Audit logs cannot be updated"));
});

// Indexes for querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

