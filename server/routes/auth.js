const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../database');

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, accountType } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'First name, last name, email, and password are required.' });
        }

        // Check if email already exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const result = await query(
            'INSERT INTO users ("firstName", "lastName", email, phone, "passwordHash", "accountType") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [firstName, lastName, email, phone || '', passwordHash, accountType || 'customer']
        );

        res.status(201).json({
            message: 'Account created successfully!',
            user: {
                id: result.rows[0].id,
                firstName,
                lastName,
                email,
                accountType: accountType || 'customer'
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// Sign In
router.post('/signin', async (req, res) => {
    try {
        const { email, password, accountType } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Check account type if specified
        if (accountType && user.accountType !== accountType) {
            return res.status(401).json({ error: `No ${accountType} account found with this email.` });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Create session
        req.session.userId = user.id;
        req.session.user = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            accountType: user.accountType
        };

        res.json({
            message: 'Signed in successfully!',
            user: req.session.user
        });
    } catch (err) {
        console.error('Signin error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// Get current user (session check)
router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ user: null });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.json({ message: 'Logged out successfully.' });
    });
});

module.exports = router;
