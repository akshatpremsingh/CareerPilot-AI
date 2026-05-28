const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/auth');

// ======================
// RATE LIMITER
// ======================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many requests. Try again later.'
});

// ======================
// SIGNUP
// ======================

router.post('/signup', limiter, async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;

        // Validation
        if (!name || !email || !password) {

            return res.status(400).json({
                msg: 'Please provide name, email and password'
            });

        }

        if (!validator.isEmail(email)) {

            return res.status(400).json({
                msg: 'Invalid email format'
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                msg: 'Password must be at least 6 characters'
            });

        }

        // Normalize role
        const normalizedRole =
            (role || 'student')
            .toLowerCase()
            .trim();

        const validRoles = [
            'student',
            'mentor'
        ];

        if (!validRoles.includes(normalizedRole)) {

            return res.status(400).json({
                msg: 'Invalid role'
            });

        }

        // Existing email check
        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (existingUser) {

            return res.status(400).json({
                msg: 'Email already exists'
            });

        }

        // Hash password
        const salt =
            await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(password, salt);

        // Create user
        const user = new User({

            name: validator.escape(name),

            fullName: validator.escape(name),

            email: email.toLowerCase(),

            password: hashedPassword,

            role: normalizedRole,

            profileCompleted: false

        });

        await user.save();

        // Token
        const token = jwt.sign(

            {
                userId: user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '7d'
            }

        );

        res.status(201).json({

            token,

            user: {

                id: user._id,

                fullName:
                    user.fullName,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                profileCompleted:
                    user.profileCompleted

            }

        });

    } catch (err) {

        console.error(
            'Signup error:',
            err.message
        );

        res.status(500).json({
            msg: 'Server error during signup'
        });

    }

});

// ======================
// LOGIN
// ======================

router.post('/login', limiter, async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        // Validation
        if (!email || !password) {

            return res.status(400).json({
                msg: 'Please provide email and password'
            });

        }

        if (!validator.isEmail(email)) {

            return res.status(400).json({
                msg: 'Invalid email format'
            });

        }

        // Find user
        const user =
            await User.findOne({
                email: email.toLowerCase()
            });

        if (!user) {

            return res.status(400).json({
                msg: 'Invalid email or password'
            });

        }

        // Password check
        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(400).json({
                msg: 'Invalid email or password'
            });

        }

        // Token
        const token = jwt.sign(

            {
                userId: user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '7d'
            }

        );

        res.json({

            token,

            user: {

                id: user._id,

                fullName:
                    user.fullName,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                profileCompleted:
                    user.profileCompleted,

                educationLevel:
                    user.educationLevel,

                skills:
                    user.skills,

                careerGoal:
                    user.careerGoal

            }

        });

    } catch (err) {

        console.error(
            'Login error:',
            err.message
        );

        res.status(500).json({
            msg: 'Server error during login'
        });

    }

});

// ======================
// GET CURRENT USER
// ======================

router.get('/me', auth, async (req, res) => {

    try {

        const user =
            await User.findById(
                req.user.userId
            ).select('-password');

        if (!user) {

            return res.status(404).json({
                msg: 'User not found'
            });

        }

        // IMPORTANT FIX
        res.json(user);

    } catch (err) {

        console.error(
            'Get user error:',
            err.message
        );

        res.status(500).json({
            msg: 'Server error fetching user'
        });

    }

});

// ======================
// UPDATE PROFILE
// ======================

router.put('/profile', auth, async (req, res) => {

    try {

        const {
            fullName,
            educationLevel,
            skills,
            careerGoal
        } = req.body;

        // Validation
        if (
            !educationLevel ||
            !skills ||
            !careerGoal
        ) {

            return res.status(400).json({
                msg:
                    'Please fill all fields'
            });

        }

        if (!Array.isArray(skills)) {

            return res.status(400).json({
                msg:
                    'Skills must be an array'
            });

        }

        const updatedUser =
            await User.findByIdAndUpdate(

                req.user.userId,

                {

                    fullName:
                        validator.escape(
                            fullName || ''
                        ),

                    educationLevel:
                        validator.escape(
                            educationLevel
                        ),

                    skills:
                        skills.map(skill =>
                            validator.escape(skill)
                        ),

                    careerGoal:
                        validator.escape(
                            careerGoal
                        ),

                    profileCompleted: true,

                    updatedAt:
                        new Date()

                },

                {
                    new: true
                }

            ).select('-password');

        if (!updatedUser) {

            return res.status(404).json({
                msg: 'User not found'
            });

        }

        res.json({

            msg:
                'Profile updated successfully',

            user:
                updatedUser

        });

    } catch (err) {

        console.error(
            'Profile update error:',
            err.message
        );

        res.status(500).json({
            msg:
                'Error updating profile'
        });

    }

});

module.exports = router;