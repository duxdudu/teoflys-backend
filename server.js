const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Import routes
const authRoutes = require('./routes/auth');
const galleryRoutes = require('./routes/gallery');
const adminRoutes = require('./routes/admin');
const testimonialRoutes = require('./routes/testimonials');

// Import models for status endpoint
const User = require('./models/User');
const Gallery = require('./models/Gallery');
const Testimonial = require('./models/Testimonial');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://teofly-photography.onrender.com',
    'https://teoflys-frontend.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Update the middleware section with secure headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'credentials-autocomplete-api=()');
  next();
});
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dudufredu:admin@cluster0.hdsqbzx.mongodb.net/', {
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Initialize admin user
  const initializeAdmin = require('./scripts/init-admin');
  await initializeAdmin();
})
.catch(err => console.error('MongoDB connection error:', err));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Teofly Gallery API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Status endpoint with more details
app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const adminCount = await User.countDocuments({ role: 'admin' });
    const galleryCount = await Gallery.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    
    res.json({
      status: 'OK',
      server: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000
      },
      database: {
        status: dbStatus,
        adminUsers: adminCount,
        galleryItems: galleryCount,
        testimonials: testimonialCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error getting status', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 