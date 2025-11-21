// ... existing code ...
const orderOrchestration = require("../services/orderOrchestration");

/**
 * @route   POST /api/orders/submit
 * @desc    Submit order with orchestration
 * @access  Private
 */
router.post("/submit", protect, async (req, res) => {
  try {
    const { idempotencyKey } = req.headers;

    // Check for duplicate idempotency key
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          data: existingOrder,
          message: "Order already processed",
        });
      }
    }

    const order = await orderOrchestration.createOrder(req.body, req.user.id);

    if (idempotencyKey) {
      order.idempotencyKey = idempotencyKey;
      await order.save();
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Order submission error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error submitting order",
    });
  }
});

/**
 * @route   GET /api/orders/:id/status
 * @desc    Get order status
 * @access  Private
 */
router.get("/:id/status", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order || order.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: order._id,
        state: order.state,
        status: order.state,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error fetching order status",
    });
  }
});

// ... rest of routes ...

