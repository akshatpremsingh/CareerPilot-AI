const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/auth');

// Rate limiter for signup and login
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per IP
  message: 'Too many requests, please try again later.'
});

// Signup
router.post('/signup', limiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide name, email, and password' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // Normalize role (lowercase + trim)
    const normalizedRole = (role || '').toLowerCase().trim();
    const validRoles = ['student', 'mentor'];
    if (normalizedRole && !validRoles.includes(normalizedRole)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ msg: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: validator.escape(name),
      email: email.toLowerCase(),
      password: hashed,
      role: normalizedRole || 'student'   // ✅ Default to student
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Respond
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ msg: 'Server error during signup' });
  }
});


// Login
router.post('/login', limiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: 'Invalid email format' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ msg: 'Server error fetching user' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { educationLevel, skills, careerGoal } = req.body;

    // Validate inputs
    if (!educationLevel || !skills || !careerGoal) {
      return res.status(400).json({ msg: 'Please provide educationLevel, skills, and careerGoal' });
    }
    if (!Array.isArray(skills)) {
      return res.status(400).json({ msg: 'Skills must be an array' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        educationLevel: validator.escape(educationLevel),
        skills: skills.map(skill => validator.escape(skill)),
        careerGoal: validator.escape(careerGoal),
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ msg: 'Error updating profile' });
  }
});

module.exports = router;