// ... existing code ...

/**
 * @route   GET /api/orders/:id/tracking
 * @desc    Get shipment tracking information
 * @access  Private
 */
router.get("/:id/tracking", protect, async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: "Error fetching tracking information",
    });
  }
});

/**
 * @route   POST /api/orders/webhook/tracking
 * @desc    Webhook endpoint for carrier tracking updates
 * @access  Public (with webhook secret validation)
 */
router.post("/webhook/tracking", async (req, res) => {
  try {
    // Validate webhook secret
    const webhookSecret = req.headers["x-webhook-secret"];
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { carrier, trackingNumber, status, location, timestamp } = req.body;

    // Find shipment by tracking number
    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    // Update shipment status
    shipment.status = status;
    shipment.currentLocation = location;
    shipment.timeline.push({
      status,
      location,
      timestamp: new Date(timestamp),
    });
    await shipment.save();

    // Update order status if delivered
    if (status === "delivered") {
      await Order.findByIdAndUpdate(shipment.orderId, { state: "delivered" });
    }

    // Send notification to user
    await sendTrackingNotification(shipment.userId, {
      status,
      location,
      trackingNumber,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

async function sendTrackingNotification(userId, data) {
  // Implementation: Send email/push notification
}

// ... rest of routes ...

