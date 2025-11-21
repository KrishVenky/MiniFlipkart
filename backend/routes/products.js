// ... existing code ...

// @route   GET /api/products/:id
// @desc    Get single product by ID with media and reviews
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("reviews.userId", "name")
      .select("-__v");

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Format media arrays
    const media = {
      images: product.images || [product.image || "/imgs/default.png"],
      videos: product.videos || [],
    };

    // Format review summaries
    const reviews = product.reviews || [];
    const reviewSummary = {
      averageRating: reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0,
      totalReviews: reviews.length,
      reviews: reviews.slice(0, 5).map((r) => ({
        name: r.userId?.name || "Anonymous",
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        media,
        reviewSummary,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error fetching product",
    });
  }
});

// ... rest of existing routes ...

