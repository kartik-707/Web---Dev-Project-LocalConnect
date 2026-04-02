const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../database');

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
router.get('/listings', async (req, res) => {
    try {
        const { search, category, rating, sort, page = 1, limit = 12 } = req.query;

        let whereClauses = ["b.status = 'approved'"];
        let params = [];
        let paramIndex = 1;

        if (category && category !== 'All Categories' && category !== '') {
            whereClauses.push(`b.category = $${paramIndex++}`);
            params.push(category);
        }

        if (rating && rating !== '' && rating !== 'all') {
            const minRating = parseFloat(rating);
            if (!isNaN(minRating)) {
                whereClauses.push(`b.rating >= $${paramIndex++}`);
                params.push(minRating);
            }
        }

        if (search && search.trim() !== '') {
            const searchTerm = `%${search.trim()}%`;
            whereClauses.push(`(b."businessName" ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex} OR b.services ILIKE $${paramIndex} OR b.category ILIKE $${paramIndex})`);
            paramIndex++;
            params.push(searchTerm);
        }

        const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        let orderSQL = 'ORDER BY b.rating DESC, b."reviewCount" DESC';
        if (sort === 'rating') orderSQL = 'ORDER BY b.rating DESC';
        else if (sort === 'reviews') orderSQL = 'ORDER BY b."reviewCount" DESC';
        else if (sort === 'newest') orderSQL = 'ORDER BY b."createdAt" DESC';
        else if (sort === 'name') orderSQL = 'ORDER BY b."businessName" ASC';
        else if (sort === 'years') orderSQL = 'ORDER BY b."yearsInBusiness" DESC';

        const countResult = await query(`SELECT COUNT(*) as total FROM businesses b ${whereSQL}`, params);
        const total = parseInt(countResult.rows[0].total);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const listingsResult = await query(`
            SELECT b.*, 
                (SELECT STRING_AGG(bp.filename, ',') FROM business_photos bp WHERE bp."businessId" = b.id) as "photoFiles"
            FROM businesses b ${whereSQL} ${orderSQL} LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `, [...params, parseInt(limit), offset]);

        const results = listingsResult.rows.map(biz => ({
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
router.get('/my-listings', requireAuth, requireBusiness, async (req, res) => {
    try {
        const userId = req.session.userId;
        const result = await query(`
            SELECT b.*, 
                (SELECT STRING_AGG(bp.filename, ',') FROM business_photos bp WHERE bp."businessId" = b.id) as "photoFiles"
            FROM businesses b WHERE b."userId" = $1 ORDER BY b."createdAt" DESC
        `, [userId]);

        const results = result.rows.map(biz => ({
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
router.get('/listing/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bizResult = await query('SELECT * FROM businesses WHERE id = $1', [id]);
        if (bizResult.rows.length === 0) return res.status(404).json({ error: 'Business not found.' });

        const business = bizResult.rows[0];
        const photosResult = await query('SELECT * FROM business_photos WHERE "businessId" = $1', [id]);

        res.json({
            business: {
                ...business,
                services: safeJsonParse(business.services, []),
                hours: safeJsonParse(business.hours, {}),
                photos: photosResult.rows.map(p => ({ filename: p.filename, originalName: p.originalName }))
            }
        });
    } catch (err) {
        console.error('Get listing error:', err);
        res.status(500).json({ error: 'Failed to fetch listing.' });
    }
});

// ─── POST submit new listing (business only) ───
router.post('/listing', requireAuth, requireBusiness, upload.array('photos', 10), async (req, res) => {
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

        const result = await query(`
            INSERT INTO businesses 
            ("userId", "businessName", category, email, phone, description, address, city, state, zipcode, "serviceArea", website, "yearsInBusiness", certifications, services, hours, rating, "reviewCount", status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 0, 0, 'approved')
            RETURNING id
        `, [
            userId, businessName, category, email, phone,
            description || '', address || '', city || '', state || '', zipcode || '',
            serviceArea || '', website || '',
            yearsInBusiness ? parseInt(yearsInBusiness) : null,
            certifications || '',
            typeof services === 'string' ? services : JSON.stringify(services || []),
            typeof hours === 'string' ? hours : JSON.stringify(hours || {})
        ]);

        const businessId = result.rows[0].id;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await query('INSERT INTO business_photos ("businessId", filename, "originalName") VALUES ($1, $2, $3)', [businessId, file.filename, file.originalname]);
            }
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
router.put('/listing/:id', requireAuth, requireBusiness, upload.array('photos', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        // Verify ownership
        const existingResult = await query('SELECT * FROM businesses WHERE id = $1 AND "userId" = $2', [id, userId]);
        if (existingResult.rows.length === 0) return res.status(403).json({ error: 'You can only edit your own listings.' });

        const existing = existingResult.rows[0];

        const {
            businessName, category, email, phone,
            description, address, city, state, zipcode,
            serviceArea, website, yearsInBusiness,
            certifications, services, hours
        } = req.body;

        await query(`
            UPDATE businesses SET
                "businessName"=$1, category=$2, email=$3, phone=$4, description=$5,
                address=$6, city=$7, state=$8, zipcode=$9, "serviceArea"=$10,
                website=$11, "yearsInBusiness"=$12, certifications=$13, services=$14, hours=$15
            WHERE id=$16 AND "userId"=$17
        `, [
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
        ]);

        // Add new photos if uploaded
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                await query('INSERT INTO business_photos ("businessId", filename, "originalName") VALUES ($1, $2, $3)', [id, file.filename, file.originalname]);
            }
        }

        res.json({ message: 'Listing updated successfully!', business: { id: parseInt(id), businessName: businessName || existing.businessName } });
    } catch (err) {
        console.error('Update listing error:', err);
        res.status(500).json({ error: 'Failed to update listing.' });
    }
});

// ─── DELETE listing (owner only) ───
router.delete('/listing/:id', requireAuth, requireBusiness, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;

        const existingResult = await query('SELECT * FROM businesses WHERE id = $1 AND "userId" = $2', [id, userId]);
        if (existingResult.rows.length === 0) return res.status(403).json({ error: 'You can only delete your own listings.' });

        // Delete photos from disk
        const photosResult = await query('SELECT filename FROM business_photos WHERE "businessId" = $1', [id]);
        for (const photo of photosResult.rows) {
            const filePath = path.join(uploadsDir, photo.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Delete from DB (order matters for foreign keys)
        await query('DELETE FROM business_photos WHERE "businessId" = $1', [id]);
        await query('DELETE FROM reviews WHERE "businessId" = $1', [id]);
        await query('DELETE FROM businesses WHERE id = $1', [id]);

        res.json({ message: 'Business listing deleted successfully.' });
    } catch (err) {
        console.error('Delete listing error:', err);
        res.status(500).json({ error: 'Failed to delete listing.' });
    }
});

// ─── POST review (customers only) ───
router.post('/listing/:id/review', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.session.userId;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        // Check business exists
        const bizResult = await query('SELECT id FROM businesses WHERE id = $1', [id]);
        if (bizResult.rows.length === 0) return res.status(404).json({ error: 'Business not found.' });

        // Insert review
        await query('INSERT INTO reviews ("businessId", "userId", rating, comment) VALUES ($1, $2, $3, $4)', [id, userId, rating, comment || '']);

        // Recalculate average rating
        const statsResult = await query('SELECT AVG(rating) as "avgRating", COUNT(*) as count FROM reviews WHERE "businessId" = $1', [id]);
        const stats = statsResult.rows[0];
        const avgRating = Math.round(parseFloat(stats.avgRating) * 10) / 10;
        const count = parseInt(stats.count);

        await query('UPDATE businesses SET rating = $1, "reviewCount" = $2 WHERE id = $3', [avgRating, count, id]);

        res.status(201).json({
            message: 'Review submitted!',
            review: { rating, comment, avgRating, totalReviews: count }
        });
    } catch (err) {
        console.error('Review error:', err);
        res.status(500).json({ error: 'Failed to submit review.' });
    }
});

// ─── GET reviews for a business ───
router.get('/listing/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(`
            SELECT r.*, u."firstName", u."lastName" 
            FROM reviews r JOIN users u ON r."userId" = u.id 
            WHERE r."businessId" = $1 ORDER BY r."createdAt" DESC
        `, [id]);

        res.json({ reviews: result.rows });
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
