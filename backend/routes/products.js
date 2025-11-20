const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Product = require("../models/Product");
const { protect, authorize } = require("../middleware/auth");

/**
 * Validation schema for product list filters
 */
const productFilterSchema = Joi.object({
  category: Joi.string().valid("electronics", "men", "women", "jewelry").optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  search: Joi.string().max(100).optional(),
  sort: Joi.string().valid("price-asc", "price-desc", "-createdAt", "rating").default("-createdAt"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get("/", async (req, res) => {
  try {
    // Validate query parameters
    const { error, value } = productFilterSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { category, minPrice, maxPrice, search, sort, page, limit } = value;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category.toLowerCase();
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    let sortOption = sort;
    
    if (sort === "price-asc") sortOption = "price";
    if (sort === "price-desc") sortOption = "-price";
    if (sort === "rating") sortOption = "-rating";

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching products",
    });
  }
});

// ... rest of existing routes ...

module.exports = router;

