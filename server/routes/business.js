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

// Auth middleware — checks if user is logged in
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'You must be logged in.' });
    }
    next();
}

// Business-only middleware
function requireBusiness(req, res, next) {
    if (!req.session || !req.session.user || req.session.user.accountType !== 'business') {
        return res.status(403).json({ error: 'Only business accounts can perform this action.' });
    }
    next();
}

// ─── GET all listings (with filters, search, sort, pagination) ───
router.get('/listings', (req, res) => {
    try {
        const { search, category, rating, sort, page = 1, limit = 12 } = req.query;

        let whereClauses = ["b.status = 'approved'"];
        let params = [];

        if (category && category !== 'All Categories' && category !== '') {
            whereClauses.push('b.category = ?');
            params.push(category);
        }

        if (rating && rating !== '' && rating !== 'all') {
            const minRating = parseFloat(rating);
            if (!isNaN(minRating)) {
                whereClauses.push('b.rating >= ?');
                params.push(minRating);
            }
        }

        if (search && search.trim() !== '') {
            const searchTerm = `%${search.trim()}%`;
            whereClauses.push('(b.businessName LIKE ? OR b.description LIKE ? OR b.services LIKE ? OR b.category LIKE ?)');
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        let orderSQL = 'ORDER BY b.rating DESC, b.reviewCount DESC';
        if (sort === 'rating') orderSQL = 'ORDER BY b.rating DESC';
        else if (sort === 'reviews') orderSQL = 'ORDER BY b.reviewCount DESC';
        else if (sort === 'newest') orderSQL = 'ORDER BY b.createdAt DESC';
        else if (sort === 'name') orderSQL = 'ORDER BY b.businessName ASC';
        else if (sort === 'years') orderSQL = 'ORDER BY b.yearsInBusiness DESC';

        const { total } = db.prepare(`SELECT COUNT(*) as total FROM businesses b ${whereSQL}`).get(...params);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const businesses = db.prepare(`
            SELECT b.*, 
                (SELECT GROUP_CONCAT(bp.filename) FROM business_photos bp WHERE bp.businessId = b.id) as photoFiles
            FROM businesses b ${whereSQL} ${orderSQL} LIMIT ? OFFSET ?
        `).all(...params, parseInt(limit), offset);

        const results = businesses.map(biz => ({
            ...biz,
            services: safeJsonParse(biz.services, []),
            hours: safeJsonParse(biz.hours, {}),
            photos: biz.photoFiles ? biz.photoFiles.split(',') : []
        }));

        res.json({ businesses: results, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Get listings error:', err);
        res.status(500).json({ error: 'Failed to fetch listings.' });
    }
});

// ─── GET my listings (business owner only) ───
router.get('/my-listings', requireAuth, requireBusiness, (req, res) => {
    try {
        const userId = req.session.userId;
        const businesses = db.prepare(`
            SELECT b.*, 
                (SELECT GROUP_CONCAT(bp.filename) FROM business_photos bp WHERE bp.businessId = b.id) as photoFiles
            FROM businesses b WHERE b.userId = ? ORDER BY b.createdAt DESC
        `).all(userId);

        const results = businesses.map(biz => ({
            ...biz,
            services: safeJsonParse(biz.services, []),
            hours: safeJsonParse(biz.hours, {}),
            photos: biz.photoFiles ? biz.photoFiles.split(',') : []
        }));

        res.json({ businesses: results });
    } catch (err) {
        console.error('My listings error:', err);
        res.status(500).json({ error: 'Failed to fetch your listings.' });
    }
});

// ─── GET single listing by ID ───
router.get('/listing/:id', (req, res) => {
    try {
        const { id } = req.params;
        const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(id);
        if (!business) return res.status(404).json({ error: 'Business not found.' });

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

// ─── POST submit new listing (business only) ───
router.post('/listing', requireAuth, requireBusiness, upload.array('photos', 10), (req, res) => {
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

        const userId = req.session.userId;

        const result = db.prepare(`
            INSERT INTO businesses 
            (userId, businessName, category, email, phone, description, address, city, state, zipcode, serviceArea, website, yearsInBusiness, certifications, services, hours, rating, reviewCount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'approved')
        `).run(
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
            const photoStmt = db.prepare('INSERT INTO business_photos (businessId, filename, originalName) VALUES (?, ?, ?)');
            for (const file of req.files) photoStmt.run(businessId, file.filename, file.originalname);
        }

        res.status(201).json({
            message: 'Business listing submitted successfully!',
            business: { id: businessId, businessName, category, city, state, photosUploaded: req.files ? req.files.length : 0 }
        });
    } catch (err) {
        console.error('Business listing error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// ─── PUT update listing (owner only) ───
router.put('/listing/:id', requireAuth, requireBusiness, upload.array('photos', 10), (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        // Verify ownership
        const existing = db.prepare('SELECT * FROM businesses WHERE id = ? AND userId = ?').get(id, userId);
        if (!existing) return res.status(403).json({ error: 'You can only edit your own listings.' });

        const {
            businessName, category, email, phone,
            description, address, city, state, zipcode,
            serviceArea, website, yearsInBusiness,
            certifications, services, hours
        } = req.body;

        db.prepare(`
            UPDATE businesses SET
                businessName=?, category=?, email=?, phone=?, description=?,
                address=?, city=?, state=?, zipcode=?, serviceArea=?,
                website=?, yearsInBusiness=?, certifications=?, services=?, hours=?
            WHERE id=? AND userId=?
        `).run(
            businessName || existing.businessName,
            category || existing.category,
            email || existing.email,
            phone || existing.phone,
            description !== undefined ? description : existing.description,
            address !== undefined ? address : existing.address,
            city !== undefined ? city : existing.city,
            state !== undefined ? state : existing.state,
            zipcode !== undefined ? zipcode : existing.zipcode,
            serviceArea !== undefined ? serviceArea : existing.serviceArea,
            website !== undefined ? website : existing.website,
            yearsInBusiness ? parseInt(yearsInBusiness) : existing.yearsInBusiness,
            certifications !== undefined ? certifications : existing.certifications,
            typeof services === 'string' ? services : (existing.services || '[]'),
            typeof hours === 'string' ? hours : (existing.hours || '{}'),
            id, userId
        );

        // Add new photos if uploaded
        if (req.files && req.files.length > 0) {
            const photoStmt = db.prepare('INSERT INTO business_photos (businessId, filename, originalName) VALUES (?, ?, ?)');
            for (const file of req.files) photoStmt.run(id, file.filename, file.originalname);
        }

        res.json({ message: 'Listing updated successfully!', business: { id: parseInt(id), businessName: businessName || existing.businessName } });
    } catch (err) {
        console.error('Update listing error:', err);
        res.status(500).json({ error: 'Failed to update listing.' });
    }
});

// ─── DELETE listing (owner only) ───
router.delete('/listing/:id', requireAuth, requireBusiness, (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const existing = db.prepare('SELECT * FROM businesses WHERE id = ? AND userId = ?').get(id, userId);
        if (!existing) return res.status(403).json({ error: 'You can only delete your own listings.' });

        // Delete photos from disk
        const photos = db.prepare('SELECT filename FROM business_photos WHERE businessId = ?').all(id);
        for (const photo of photos) {
            const filePath = path.join(uploadsDir, photo.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Delete from DB
        db.prepare('DELETE FROM business_photos WHERE businessId = ?').run(id);
        db.prepare('DELETE FROM reviews WHERE businessId = ?').run(id);
        db.prepare('DELETE FROM businesses WHERE id = ?').run(id);

        res.json({ message: 'Business listing deleted successfully.' });
    } catch (err) {
        console.error('Delete listing error:', err);
        res.status(500).json({ error: 'Failed to delete listing.' });
    }
});

// ─── POST review (customers only) ───
router.post('/listing/:id/review', requireAuth, (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        // Check business exists
        const business = db.prepare('SELECT id FROM businesses WHERE id = ?').get(id);
        if (!business) return res.status(404).json({ error: 'Business not found.' });

        // Insert review
        db.prepare('INSERT INTO reviews (businessId, userId, rating, comment) VALUES (?, ?, ?, ?)').run(id, userId, rating, comment || '');

        // Recalculate average rating
        const stats = db.prepare('SELECT AVG(rating) as avgRating, COUNT(*) as count FROM reviews WHERE businessId = ?').get(id);
        db.prepare('UPDATE businesses SET rating = ?, reviewCount = ? WHERE id = ?').run(
            Math.round(stats.avgRating * 10) / 10,
            stats.count,
            id
        );

        res.status(201).json({
            message: 'Review submitted!',
            review: { rating, comment, avgRating: Math.round(stats.avgRating * 10) / 10, totalReviews: stats.count }
        });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ error: 'Failed to submit review.' });
    }
});

// ─── GET reviews for a business ───
router.get('/listing/:id/reviews', (req, res) => {
    try {
        const { id } = req.params;
        const reviews = db.prepare(`
            SELECT r.*, u.firstName, u.lastName 
            FROM reviews r JOIN users u ON r.userId = u.id 
            WHERE r.businessId = ? ORDER BY r.createdAt DESC
        `).all(id);

        res.json({ reviews });
    } catch (err) {
        console.error('Get reviews error:', err);
        res.status(500).json({ error: 'Failed to fetch reviews.' });
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
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        return res.status(400).json({ error: err.message });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
});

module.exports = router;
