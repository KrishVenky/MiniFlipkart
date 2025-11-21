// ... existing routes ...

/**
 * @route   GET /api/products/recommendations
 * @desc    Get personalized product recommendations
 * @access  Private
 */
router.get("/recommendations", protect, async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const userId = req.user.id;

    // Check if user opted out
    const user = await User.findById(userId);
    if (user.recommendationOptOut) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Recommendations disabled by user",
      });
    }

    // Simple recommendation logic (can be enhanced with ML)
    // For now, return popular items in user's preferred categories
    const recommendations = await Product.find({ isActive: true })
      .sort("-rating -createdAt")
      .limit(Number(limit))
      .select("title price image category rating");

    // Set cache headers
    res.set("Cache-Control", "public, max-age=300"); // 5 minutes

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching recommendations",
    });
  }
});

// ... rest of routes ...

