const express = require('express');
const { query } = require('../database');

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }

        await query(
            'INSERT INTO contact_messages ("firstName", "lastName", email, phone, subject, message) VALUES ($1, $2, $3, $4, $5, $6)',
            [firstName, lastName, email, phone || '', subject, message]
        );

        res.status(201).json({ message: 'Message sent successfully! We will get back to you within 24 hours.' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
