const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwt'); // Adjust if your middleware path is different
const User = require('../models/User'); // Your User mongoose model

// POST /api/onboarding
router.post('/', jwtMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming jwtMiddleware attaches user info here
    const { fullName, educationLevel, skills, careerGoal } = req.body;

    // Basic validation
    if (!fullName || !educationLevel || !skills || !careerGoal) {
      return res.status(400).json({ success: false, msg: 'All fields are required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        educationLevel,
        skills,
        careerGoal,
        profileCompleted: true,
        profileCompletedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: 'User not found.' });
    }

    res.json({ success: true, msg: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
tre