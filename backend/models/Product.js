// ... existing schema ...

const productSchema = new mongoose.Schema({
  // ... existing fields ...
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  reservedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lowStockAlert: {
    type: Boolean,
    default: false,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  lastSyncedAt: {
    type: Date,
  },
  // ... rest of fields ...
});

// Virtual for available stock
productSchema.virtual("availableStock").get(function() {
  return Math.max(0, this.stock - this.reservedCount);
});

// Pre-save hook to check low stock
productSchema.pre("save", function(next) {
  if (this.stock <= this.lowStockThreshold) {
    this.lowStockAlert = true;
  } else {
    this.lowStockAlert = false;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);

