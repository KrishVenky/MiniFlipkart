const express = require("express");
const Product = require("../models/Product");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    List active catalog products
 * @access  Public
 */
router.get("/", async (req, res) => {
  const products = await Product.find({ isActive: true }).sort("-createdAt");
  res.json({ success: true, data: products });
});

/**
 * @route   GET /api/products/:id
 * @desc    Retrieve a specific product
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: "Product not found" });
  }

  return res.json({ success: true, data: product });
});

/**
 * @route   GET /api/products/recommendations
 * @desc    Get personalized product recommendations
 * @access  Private
 */
router.get("/recommendations/list", protect, async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const userId = req.user.id;

    // Check if user opted out
    const user = await User.findById(userId);
    if (user?.recommendationOptOut) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Recommendations disabled by user",
      });
    }

    // Simple recommendation logic (can be enhanced with ML)
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

module.exports = router;
