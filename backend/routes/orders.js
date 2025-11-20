// ... existing code ...

/**
 * @route   POST /api/orders/checkout/save
 * @desc    Save intermediate checkout data
 * @access  Private
 */
router.post("/checkout/save", protect, async (req, res) => {
  try {
    const { step, data } = req.body;
    const userId = req.user.id;

    // Save checkout progress
    const checkoutData = await CheckoutProgress.findOneAndUpdate(
      { userId },
      {
        userId,
        step,
        data,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Generate resume token
    const resumeToken = jwt.sign(
      { checkoutId: checkoutData._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      resumeToken,
      step: checkoutData.step,
    });
  } catch (error) {
    console.error("Save checkout error:", error);
    res.status(500).json({
      success: false,
      error: "Error saving checkout progress",
    });
  }
});

/**
 * @route   GET /api/orders/checkout/resume
 * @desc    Resume checkout from saved state
 * @access  Private
 */
router.get("/checkout/resume", protect, async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const checkoutData = await CheckoutProgress.findById(decoded.checkoutId);
    if (!checkoutData) {
      return res.status(404).json({
        success: false,
        error: "Checkout session not found",
      });
    }

    res.status(200).json({
      success: true,
      step: checkoutData.step,
      data: checkoutData.data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Invalid or expired resume token",
    });
  }
});

// ... rest of routes ...

