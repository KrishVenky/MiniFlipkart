const mongoose = require("mongoose");

/**
 * Product catalog schema used for inventory and ordering.
 */
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "general",
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Calculate available inventory dynamically.
 */
productSchema.virtual("availableStock").get(function availableStock() {
  return Math.max(0, this.stock - this.reservedCount);
});

/**
 * Maintain low stock alert flag automatically.
 */
productSchema.pre("save", function updateLowStock(next) {
  this.lowStockAlert = this.stock <= this.lowStockThreshold;
  next();
});

module.exports = mongoose.model("Product", productSchema);

