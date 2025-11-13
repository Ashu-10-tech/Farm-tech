const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// @route   POST /api/auth/register
// @desc    Register a new user (Farmer or Company)
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists.' });
        }
        
        // 1. Create new user instance
        user = new User({ username, email, password, role });

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 3. Save user
        await user.save();

        res.status(201).json({ msg: 'Registration successful. Please log in.' });

    } catch (err) {
        console.error(err.message);
        // FIX: Return JSON object instead of plain text on 500 error
        res.status(500).json({ msg: 'Server error during registration.', error: err.message }); 
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Find user by username
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 3. Create and return JWT
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: user.role, username: user.username });
            }
        );

    } catch (err) {
        console.error(err.message);
        // FIX: Return JSON object instead of plain text on 500 error
        res.status(500).json({ msg: 'Server error during login.', error: err.message });
    }
});

module.exports = router;