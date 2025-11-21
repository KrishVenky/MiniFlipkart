// ... existing schema ...

const checkoutProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  step: {
    type: String,
    enum: ["cart", "shipping", "payment", "review"],
    default: "cart",
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ... existing order schema with state enums ...

const orderSchema = new mongoose.Schema({
  // ... existing fields ...
  state: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  auditRefs: [{
    action: String,
    timestamp: Date,
    userId: mongoose.Schema.Types.ObjectId,
  }],
  // ... rest of fields ...
});

// ... rest of model ...

module.exports = {
  Order: mongoose.model("Order", orderSchema),
  CheckoutProgress: mongoose.model("CheckoutProgress", checkoutProgressSchema),
};

