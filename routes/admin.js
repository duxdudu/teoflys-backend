const express = require('express');
const Gallery = require('../models/Gallery');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { upload, deleteImage } = require('../config/cloudinary');

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Upload new photo
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST START ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);
    console.log('=== UPLOAD REQUEST END ===');

    const { title, description, category, tags, isFeatured, isPublished } = req.body;

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'Image file is required' });
    }

    console.log('✅ File uploaded successfully:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Validate required fields
    if (!title) {
      console.log('❌ Title is required');
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!req.user || !req.user._id) {
      console.log('❌ User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const galleryItem = new Gallery({
      title,
      description,
      category: category || 'other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isFeatured: isFeatured === 'true',
      isPublished: isPublished !== 'false',
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      publicId: req.file.filename,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format,
      size: req.file.size,
      uploadedBy: req.user._id
    });

    console.log('📝 Saving gallery item:', {
      title: galleryItem.title,
      category: galleryItem.category,
      imageUrl: galleryItem.imageUrl,
      uploadedBy: galleryItem.uploadedBy
    });

    await galleryItem.save();

    console.log('✅ Gallery item saved successfully');

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: galleryItem
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to upload photo', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all photos (admin view)
router.get('/photos', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, published } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category;
    if (published !== undefined) query.isPublished = published === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const photos = await Gallery.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Gallery.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      photos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Admin photos fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Update photo
router.put('/photos/:id', async (req, res) => {
  try {
    const { title, description, category, tags, isFeatured, isPublished } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags.split(',').map(tag => tag.trim());
    if (isFeatured !== undefined) updates.isFeatured = isFeatured === 'true';
    if (isPublished !== undefined) updates.isPublished = isPublished === 'true';

    const photo = await Gallery.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name');

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({
      message: 'Photo updated successfully',
      photo
    });

  } catch (error) {
    console.error('Photo update error:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Delete photo
router.delete('/photos/:id', async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete from Cloudinary
    try {
      await deleteImage(photo.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ message: 'Photo deleted successfully' });

  } catch (error) {
    console.error('Photo delete error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalPhotos, publishedPhotos, featuredPhotos, totalViews] = await Promise.all([
      Gallery.countDocuments(),
      Gallery.countDocuments({ isPublished: true }),
      Gallery.countDocuments({ isFeatured: true }),
      Gallery.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ])
    ]);

    res.json({
      stats: {
        totalPhotos,
        publishedPhotos,
        featuredPhotos,
        totalViews: totalViews[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 