const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'business-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── GET all listings (with filters, search, sort, pagination) ───
router.get('/listings', (req, res) => {
    try {
        const { search, category, rating, sort, page = 1, limit = 12 } = req.query;

        let whereClauses = ["b.status = 'approved'"];
        let params = [];

        // Category filter
        if (category && category !== 'All Categories' && category !== '') {
            whereClauses.push('b.category = ?');
            params.push(category);
        }

        // Rating filter
        if (rating && rating !== '' && rating !== 'all') {
            const minRating = parseFloat(rating);
            if (!isNaN(minRating)) {
                whereClauses.push('b.rating >= ?');
                params.push(minRating);
            }
        }

        // Search filter — searches in businessName, description, services, category
        if (search && search.trim() !== '') {
            const searchTerm = `%${search.trim()}%`;
            whereClauses.push('(b.businessName LIKE ? OR b.description LIKE ? OR b.services LIKE ? OR b.category LIKE ?)');
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // Sort
        let orderSQL = 'ORDER BY b.rating DESC, b.reviewCount DESC'; // default: recommended
        if (sort === 'rating') {
            orderSQL = 'ORDER BY b.rating DESC';
        } else if (sort === 'reviews') {
            orderSQL = 'ORDER BY b.reviewCount DESC';
        } else if (sort === 'newest') {
            orderSQL = 'ORDER BY b.createdAt DESC';
        } else if (sort === 'name') {
            orderSQL = 'ORDER BY b.businessName ASC';
        } else if (sort === 'years') {
            orderSQL = 'ORDER BY b.yearsInBusiness DESC';
        }

        // Get total count
        const countSQL = `SELECT COUNT(*) as total FROM businesses b ${whereSQL}`;
        const { total } = db.prepare(countSQL).get(...params);

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const paginationSQL = `LIMIT ? OFFSET ?`;

        // Fetch businesses
        const dataSQL = `
            SELECT b.*, 
                (SELECT GROUP_CONCAT(bp.filename) FROM business_photos bp WHERE bp.businessId = b.id) as photoFiles
            FROM businesses b
            ${whereSQL}
            ${orderSQL}
            ${paginationSQL}
        `;
        const businesses = db.prepare(dataSQL).all(...params, parseInt(limit), offset);

        // Parse JSON fields and format
        const results = businesses.map(biz => ({
            ...biz,
            services: safeJsonParse(biz.services, []),
            hours: safeJsonParse(biz.hours, {}),
            photos: biz.photoFiles ? biz.photoFiles.split(',') : []
        }));

        res.json({
            businesses: results,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('Get listings error:', err);
        res.status(500).json({ error: 'Failed to fetch listings.' });
    }
});

// ─── GET single listing by ID ───
router.get('/listing/:id', (req, res) => {
    try {
        const { id } = req.params;

        const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(id);
        if (!business) {
            return res.status(404).json({ error: 'Business not found.' });
        }

        // Get photos
        const photos = db.prepare('SELECT * FROM business_photos WHERE businessId = ?').all(id);

        res.json({
            business: {
                ...business,
                services: safeJsonParse(business.services, []),
                hours: safeJsonParse(business.hours, {}),
                photos: photos.map(p => ({ filename: p.filename, originalName: p.originalName }))
            }
        });
    } catch (err) {
        console.error('Get listing error:', err);
        res.status(500).json({ error: 'Failed to fetch listing.' });
    }
});

// ─── POST submit business listing ───
router.post('/listing', upload.array('photos', 10), (req, res) => {
    try {
        const {
            businessName, category, email, phone,
            description, address, city, state, zipcode,
            serviceArea, website, yearsInBusiness,
            certifications, services, hours
        } = req.body;

        if (!businessName || !category || !email || !phone) {
            return res.status(400).json({ error: 'Business name, category, email, and phone are required.' });
        }

        const userId = req.session && req.session.userId ? req.session.userId : null;

        const stmt = db.prepare(`
            INSERT INTO businesses 
            (userId, businessName, category, email, phone, description, address, city, state, zipcode, serviceArea, website, yearsInBusiness, certifications, services, hours, rating, reviewCount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'approved')
        `);

        const result = stmt.run(
            userId, businessName, category, email, phone,
            description || '', address || '', city || '', state || '', zipcode || '',
            serviceArea || '', website || '',
            yearsInBusiness ? parseInt(yearsInBusiness) : null,
            certifications || '',
            typeof services === 'string' ? services : JSON.stringify(services || []),
            typeof hours === 'string' ? hours : JSON.stringify(hours || {})
        );

        const businessId = result.lastInsertRowid;

        if (req.files && req.files.length > 0) {
            const photoStmt = db.prepare(
                'INSERT INTO business_photos (businessId, filename, originalName) VALUES (?, ?, ?)'
            );
            for (const file of req.files) {
                photoStmt.run(businessId, file.filename, file.originalname);
            }
        }

        res.status(201).json({
            message: 'Business listing submitted successfully!',
            business: {
                id: businessId,
                businessName, category, city, state,
                photosUploaded: req.files ? req.files.length : 0
            }
        });
    } catch (err) {
        console.error('Business listing error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// Helper
function safeJsonParse(str, fallback) {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch { return fallback; }
}

// Handle multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

module.exports = router;
