const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['wedding', 'portrait', 'landscape', 'food', 'events', 'commercial', 'other'],
    default: 'other'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Index for efficient queries
testimonialSchema.index({ isApproved: 1, isPublished: 1 });
testimonialSchema.index({ category: 1, isPublished: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
