const express = require("express");
const router = express.Router();
const Testimonial = require("../models/Testimonial");
const { authenticateToken } = require("../middleware/auth");
const testimonialService = require("../services/TestimonialService");

// Public route - Submit testimonial
router.post("/submit", async (req, res) => {
  try {
    const { name, email, rating, message, category } = req.body;

    // Validation
    if (!name || !email || !rating || !message) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    // Check if user already submitted a testimonial recently (within 24 hours)
    const existingTestimonial = await Testimonial.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (existingTestimonial) {
      return res.status(429).json({
        error: "You can only submit one testimonial per day",
      });
    }

    const testimonial = new Testimonial({
      name,
      email: email.toLowerCase(),
      rating,
      message,
      category: category || "other",
    });

    await testimonial.save();

    res.status(201).json({
      message:
        "Testimonial submitted successfully! It will be reviewed and published soon.",
      testimonial: {
        id: testimonial._id,
        name: testimonial.name,
        rating: testimonial.rating,
        message: testimonial.message,
        category: testimonial.category,
      },
    });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    res.status(500).json({
      error: "Failed to submit testimonial",
    });
  }
});

// Public route - Get published testimonials
router.get("/published", async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;

    let query = { isApproved: true, isPublished: true };

    if (category && category !== "all") {
      query.category = category;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      // Include adminNotes so public cards can show studio replies
      .select("-email -isApproved -isPublished -__v");

    const total = await Testimonial.countDocuments(query);

    res.json({
      testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      error: "Failed to fetch testimonials",
    });
  }
});

// Admin route - Get all testimonials (requires auth)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    } else if (status === "published") {
      query.isApproved = true;
      query.isPublished = true;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin testimonials:", error);
    res.status(500).json({
      error: "Failed to fetch testimonials",
    });
  }
});

// Admin route - Approve testimonial (requires auth)
router.put("/admin/approve/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, isPublished, adminNotes } = req.body;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        error: "Testimonial not found",
      });
    }

    testimonial.isApproved = isApproved;
    testimonial.isPublished = isPublished;
    if (adminNotes) {
      testimonial.adminNotes = adminNotes;
    }

    await testimonial.save();

    res.json({
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({
      error: "Failed to update testimonial",
    });
  }
});

// Admin route - Delete testimonial (requires auth)
router.delete("/admin/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        error: "Testimonial not found",
      });
    }

    res.json({
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      error: "Failed to delete testimonial",
    });
  }
});

// Admin route - Get testimonial statistics (requires auth)
router.get("/admin/stats", authenticateToken, async (req, res) => {
  try {
    const total = await Testimonial.countDocuments();
    const pending = await Testimonial.countDocuments({ isApproved: false });
    const approved = await Testimonial.countDocuments({
      isApproved: true,
      isPublished: false,
    });
    const published = await Testimonial.countDocuments({
      isApproved: true,
      isPublished: true,
    });

    const categoryStats = await Testimonial.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const ratingStats = await Testimonial.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total,
      pending,
      approved,
      published,
      categoryStats,
      ratingStats,
    });
  } catch (error) {
    console.error("Error fetching testimonial stats:", error);
    res.status(500).json({
      error: "Failed to fetch testimonial statistics",
    });
  }
});

router.get("/approved", async (req, res) => {
  try {
    const testimonials = await testimonialService.getApprovedTestimonials();
    res.json(testimonials);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching testimonials", error: error.message });
  }
});

module.exports = router;
