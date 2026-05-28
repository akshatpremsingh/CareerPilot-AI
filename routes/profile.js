const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/profile/onboarding
router.post('/onboarding', auth, async (req, res) => {

  try {

    const {
      fullName,
      educationLevel,
      skills,
      careerGoal
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        fullName,
        educationLevel,
        skills: skills.split(',').map(skill => skill.trim()),
        careerGoal,
        profileCompleted: true
      },
      { new: true }
    );

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {

    console.error('Profile onboarding error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });

  }

});

module.exports = router;