const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function initializeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teofly-gallery', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@teofly.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'admin@teofly.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Teofly Admin',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    console.log('Default admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error initializing admin:', error);
  } finally {
    // Close the connection if this script is run standalone
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the initialization
if (require.main === module) {
  initializeAdmin();
}

module.exports = initializeAdmin; 