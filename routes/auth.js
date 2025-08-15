const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  authenticateToken,
  validateRefreshToken,
  generateTokens,
  loginLimiter,
  isStrongPassword, // Make sure this is imported
} = require("../middleware/auth");
require("dotenv").config();
const passwordStrength = require("zxcvbn");

const router = express.Router();

// Admin Login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
        code: "INVALID_INPUT",
      });
    }

    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens for database user
    const tokens = generateTokens(user._id);

    return res.json({
      success: true,
      message: "Login successful",
      tokens,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Server error",
      code: "SERVER_ERROR",
    });
  }
});

// Add a new route to create first admin using environment variables
router.post("/create-first-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if credentials match environment variables
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        error: "Invalid credentials for admin creation",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({
        error: "Admin already exists",
        code: "ADMIN_EXISTS",
      });
    }

    // Create first admin user
    const adminUser = new User({
      email: email.toLowerCase(),
      password,
      name: "Admin",
      role: "admin",
    });

    await adminUser.save();

    res.status(201).json({
      message: "First admin created successfully",
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    res.status(500).json({
      error: "Server error",
      code: "SERVER_ERROR",
    });
  }
});

// Register new admin (protected route)
router.post("/register", authenticateToken, async (req, res) => {
  try {
    const { email, password, name, role = "admin" } = req.body;

    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Only admins can register new users",
      });
    }

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }

    // Check password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters",
        code: "WEAK_PASSWORD",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      role,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          error: "Email is already taken",
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    // Check new password strength
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters",
        code: "WEAK_PASSWORD",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Logout (client-side token removal)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // In a more complex system, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Refresh token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token is required",
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    const tokens = await validateRefreshToken(refreshToken);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({
      error: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }
});

module.exports = router;