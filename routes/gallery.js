const express = require('express');
const Gallery = require('../models/Gallery');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all published photos with pagination and filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      featured,
      sort = 'createdAt'
    } = req.query;

    // Build query
    const query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};

    // Handle sorting
    switch (sort) {
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'title':
        sortOptions.title = 1;
        break;
      case 'views':
        sortOptions.views = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Execute query
    const photos = await Gallery.find(query)
      .populate('uploadedBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Gallery.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      photos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Gallery fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch gallery'
    });
  }
});

// Get categories with photo counts
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await Gallery.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories: stats });

  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch category statistics'
    });
  }
});

// Get featured photos
router.get('/featured/list', async (req, res) => {
  try {
    const featuredPhotos = await Gallery.find({
      isPublished: true,
      isFeatured: true
    })
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

    res.json({ photos: featuredPhotos });

  } catch (error) {
    console.error('Featured photos error:', error);
    res.status(500).json({
      error: 'Failed to fetch featured photos'
    });
  }
});

// Search photos
router.get('/search/query', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const photos = await Gallery.find({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

    res.json({ photos });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to search photos'
    });
  }
});

// Get random photos for similar suggestions
router.get('/:id/similar', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found'
      });
    }

    const similarPhotos = await Gallery.find({
      _id: { $ne: req.params.id },
      isPublished: true,
      $or: [
        { category: photo.category },
        { tags: { $in: photo.tags } }
      ]
    })
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

    res.json({ photos: similarPhotos });

  } catch (error) {
    console.error('Similar photos error:', error);
    res.status(500).json({
      error: 'Failed to fetch similar photos'
    });
  }
});

// Get photo by ID (must be last to avoid catching other routes)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const photo = await Gallery.findOne({
      _id: req.params.id,
      isPublished: true
    }).populate('uploadedBy', 'name');

    if (!photo) {
      return res.status(404).json({
        error: 'Photo not found'
      });
    }

    // Increment view count
    photo.views += 1;
    await photo.save();

    res.json({ photo });

  } catch (error) {
    console.error('Photo fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch photo'
    });
  }
});

module.exports = router; 