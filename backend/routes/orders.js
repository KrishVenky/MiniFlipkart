const express = require("express");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");
const orderOrchestration = require("../services/orderOrchestration");
const { protect } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();
const CHECKOUT_SESSION_TTL = 15 * 60 * 1000; // 15 minutes
const checkoutSessions = new Map();

/**
 * Validate express-validator results.
 * @param {import("express").Request} req
 * @returns {import("express-validator").Result}
 */
const ensureValid = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationError = new AppError("Validation failed", 400);
    validationError.details = errors.array();
    throw validationError;
  }
  return errors;
};

/**
 * Extracts a consistent idempotency key from headers.
 */
const getIdempotencyKey = (req) => {
  return (
    req.headers["idempotency-key"] ||
    req.headers.idempotencykey ||
    req.headers["x-idempotency-key"] ||
    null
  );
};

/**
 * @route   POST /api/orders/checkout/save
 * @desc    Save checkout progress for resumable flows
 * @access  Private
 */
router.post(
  "/checkout/save",
  protect,
  [
    body("step").isString().trim().notEmpty().withMessage("Step is required"),
    body("data").isObject().withMessage("Step payload is required"),
  ],
  async (req, res, next) => {
    try {
      ensureValid(req);

      const resumeToken = crypto.randomUUID();
      checkoutSessions.set(resumeToken, {
        userId: req.user.id.toString(),
        step: req.body.step,
        data: req.body.data,
        updatedAt: Date.now(),
      });

      res.status(200).json({
        success: true,
        resumeToken,
        expiresAt: new Date(Date.now() + CHECKOUT_SESSION_TTL).toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/orders/checkout/resume
 * @desc    Resume checkout progress
 * @access  Private
 */
router.get("/checkout/resume", protect, async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      throw new AppError("Resume token is required", 400);
    }

    const session = checkoutSessions.get(token);
    const now = Date.now();
    if (
      !session ||
      session.userId !== req.user.id.toString() ||
      now - session.updatedAt > CHECKOUT_SESSION_TTL
    ) {
      return res.status(404).json({
        success: false,
        error: "Resume token not found or expired",
      });
    }

    res.status(200).json({
      success: true,
      step: session.step,
      data: session.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/orders/submit
 * @desc    Submit order with orchestration
 * @access  Private
 */
router.post(
  "/submit",
  protect,
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.productId").isString().withMessage("Product ID is required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("shippingAddress").notEmpty().withMessage("Shipping address is required"),
    body("paymentMethod").isString().notEmpty().withMessage("Payment method is required"),
  ],
  async (req, res, next) => {
    try {
      ensureValid(req);
      const idempotencyKey = getIdempotencyKey(req);

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
      }

      await order.save();
      await ensureShipment(order, req.user.id);

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/orders/:id/status
 * @desc    Get order status
 * @access  Private
 */
router.get("/:id/status", protect, async (req, res, next) => {
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
    next(error);
  }
});

/**
 * @route   GET /api/orders/:id/tracking
 * @desc    Get shipment tracking information
 * @access  Private
 */
router.get("/:id/tracking", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("shipment");

    if (!order || order.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    if (!order.shipment) {
      return res.status(404).json({
        success: false,
        error: "Tracking information not available",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        trackingNumber: order.shipment.trackingNumber,
        carrier: order.shipment.carrier,
        status: order.shipment.status,
        currentLocation: order.shipment.currentLocation,
        timeline: order.shipment.timeline,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/orders/webhook/tracking
 * @desc    Webhook endpoint for carrier tracking updates
 * @access  Public (with webhook secret validation)
 */
router.post("/webhook/tracking", async (req, res, next) => {
  try {
    const webhookSecret = req.headers["x-webhook-secret"];
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { carrier, trackingNumber, status, location, timestamp } = req.body;

    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    shipment.status = status;
    shipment.currentLocation = location;
    shipment.timeline.push({
      status,
      location,
      timestamp: new Date(timestamp),
      description: `Status updated to ${status}`,
    });
    await shipment.save();

    if (status === "delivered") {
      await Order.findByIdAndUpdate(shipment.orderId, { state: "delivered" });
    }

    await sendTrackingNotification(shipment.userId, {
      status,
      location,
      trackingNumber,
      carrier,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Ensures every order has a shipment stub so that tracking routes work.
 */
const ensureShipment = async (order, userId) => {
  if (order.shipment) {
    return order;
  }

  const shipment = await Shipment.create({
    orderId: order._id,
    userId,
    carrier: "fedex",
    carrierId: `fedex-${Date.now()}`,
    trackingNumber: `TRK-${order._id.toString().slice(-6)}-${Date.now()}`,
    status: "pending",
    currentLocation: "Fulfillment Center",
    timeline: [
      {
        status: "pending",
        location: "Fulfillment Center",
        description: "Order created",
      },
    ],
  });

  order.shipment = shipment._id;
  await order.save();
  return order;
};

/**
 * Placeholder notification dispatcher.
 */
async function sendTrackingNotification(userId, data) {
  console.log(`Notify ${userId} about shipment`, data);
}

module.exports = router;
