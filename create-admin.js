const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dudufredu:admin@cluster0.hdsqbzx.mongodb.net/', {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@teofly.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@teofly.com');
      console.log('Password: admin123');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      email: 'admin@teofly.com',
      password: 'admin123',
      name: 'Teofly Admin',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    console.log('Default admin user created successfully');
    console.log('Email: admin@teofly.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createAdmin(); 