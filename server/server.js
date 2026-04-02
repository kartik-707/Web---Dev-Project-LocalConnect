require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'localconnect-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const contactRoutes = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/contact', contactRoutes);

// Initialize database then start server
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════╗
║     🌐 LocalConnect Server Running      ║
║                                          ║
║     http://localhost:${PORT}               ║
║                                          ║
║     Press Ctrl+C to stop                 ║
╚══════════════════════════════════════════╝
            `);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    });
