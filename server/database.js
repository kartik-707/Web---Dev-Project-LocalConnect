const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'localconnect.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        passwordHash TEXT NOT NULL,
        accountType TEXT NOT NULL DEFAULT 'customer',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        businessName TEXT NOT NULL,
        category TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        description TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zipcode TEXT,
        serviceArea TEXT,
        website TEXT,
        yearsInBusiness INTEGER,
        certifications TEXT,
        services TEXT,
        hours TEXT,
        rating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        status TEXT DEFAULT 'approved',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS business_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        businessId INTEGER NOT NULL,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id)
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Add rating/reviewCount columns if they don't exist (for existing DBs)
try { db.exec('ALTER TABLE businesses ADD COLUMN rating REAL DEFAULT 0'); } catch(e) {}
try { db.exec('ALTER TABLE businesses ADD COLUMN reviewCount INTEGER DEFAULT 0'); } catch(e) {}

// Seed sample businesses if table is empty
const count = db.prepare('SELECT COUNT(*) as c FROM businesses').get().c;
if (count === 0) {
    const seedBusinesses = [
        {
            businessName: 'Master Plumbing Co.',
            category: 'Plumbing',
            email: 'contact@masterplumbing.com',
            phone: '+91 98765 11111',
            description: 'Professional plumbing services for residential and commercial properties. We specialize in emergency repairs, pipe installations, water heater services, and bathroom renovations. Our team of certified plumbers is available 24/7 to handle any plumbing issue with guaranteed quality workmanship and competitive pricing.',
            address: '45 Pipe Lane, Sector 12',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipcode: '600001',
            serviceArea: 'All Chennai, Tambaram, Velachery',
            website: 'https://masterplumbing.example.com',
            yearsInBusiness: 12,
            certifications: 'Licensed Master Plumber, ISO 9001 Certified',
            services: JSON.stringify(['Pipe Repair', 'Water Heater Installation', 'Drain Cleaning', 'Bathroom Renovation', 'Emergency Plumbing']),
            hours: JSON.stringify({ Monday: '09:00 - 18:00', Tuesday: '09:00 - 18:00', Wednesday: '09:00 - 18:00', Thursday: '09:00 - 18:00', Friday: '09:00 - 18:00', Saturday: '10:00 - 14:00', Sunday: 'Closed' }),
            rating: 4.9,
            reviewCount: 142
        },
        {
            businessName: 'PowerLine Electric Solutions',
            category: 'Electrical',
            email: 'info@powerlineelectric.com',
            phone: '+91 98765 22222',
            description: 'Expert electricians providing comprehensive residential and commercial electrical installations, repairs, and maintenance. From wiring upgrades to panel installations, our licensed professionals deliver safe, reliable, and code-compliant electrical solutions with over 15 years of industry experience.',
            address: '78 Volt Street, Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipcode: '600040',
            serviceArea: 'Anna Nagar, T. Nagar, Mylapore, Adyar',
            website: 'https://powerlineelectric.example.com',
            yearsInBusiness: 15,
            certifications: 'Licensed Electrician, NABL Accredited',
            services: JSON.stringify(['Wiring & Rewiring', 'Panel Upgrades', 'Lighting Installation', 'Generator Setup', 'Electrical Safety Inspection']),
            hours: JSON.stringify({ Monday: '08:00 - 17:00', Tuesday: '08:00 - 17:00', Wednesday: '08:00 - 17:00', Thursday: '08:00 - 17:00', Friday: '08:00 - 17:00', Saturday: '09:00 - 13:00', Sunday: 'Closed' }),
            rating: 4.8,
            reviewCount: 89
        },
        {
            businessName: 'TechPro Engineering Services',
            category: 'Engineering',
            email: 'projects@techproeng.com',
            phone: '+91 98765 33333',
            description: 'Professional engineering consulting for structural, mechanical, and electrical projects. Our team of 12 certified engineers delivers high-quality consulting, design, and project management services for residential and commercial developments with a focus on innovation and sustainability.',
            address: '120 Engineers Road, Guindy',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipcode: '600032',
            serviceArea: 'City-wide, Chennai Metropolitan Area',
            website: 'https://techproeng.example.com',
            yearsInBusiness: 8,
            certifications: 'ISO 14001, PE Certified, BIS Approved',
            services: JSON.stringify(['Structural Analysis', 'MEP Design', 'Project Management', 'Building Inspection', 'Green Building Consulting']),
            hours: JSON.stringify({ Monday: '09:00 - 18:00', Tuesday: '09:00 - 18:00', Wednesday: '09:00 - 18:00', Thursday: '09:00 - 18:00', Friday: '09:00 - 18:00', Saturday: 'Closed', Sunday: 'Closed' }),
            rating: 4.7,
            reviewCount: 67
        },
        {
            businessName: 'CleanPro Professional Cleaning',
            category: 'Cleaning',
            email: 'book@cleanpro.com',
            phone: '+91 98765 44444',
            description: 'Comprehensive cleaning services for homes and offices using eco-friendly products and trained professional staff. We offer deep cleaning, move-in/move-out cleaning, office sanitization, carpet cleaning, and customized cleaning plans. 100% satisfaction guaranteed with flexible scheduling options.',
            address: '33 Clean Avenue, Nungambakkam',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipcode: '600034',
            serviceArea: 'All Chennai, ECR, OMR Corridor',
            website: 'https://cleanpro.example.com',
            yearsInBusiness: 6,
            certifications: 'Green Clean Certified, ISSA Member',
            services: JSON.stringify(['Deep Cleaning', 'Office Cleaning', 'Carpet Cleaning', 'Post-Construction Cleanup', 'Sanitization Services']),
            hours: JSON.stringify({ Monday: '07:00 - 19:00', Tuesday: '07:00 - 19:00', Wednesday: '07:00 - 19:00', Thursday: '07:00 - 19:00', Friday: '07:00 - 19:00', Saturday: '08:00 - 16:00', Sunday: '09:00 - 14:00' }),
            rating: 5.0,
            reviewCount: 203
        },
        {
            businessName: 'Woodcraft Carpentry Masters',
            category: 'Carpentry',
            email: 'design@woodcraftmasters.com',
            phone: '+91 98765 55555',
            description: 'Custom carpentry and woodworking services with over 20 years of expertise. From bespoke furniture to complete home renovations, we craft beautiful, durable wood pieces using premium materials. Specializing in modular kitchens, wardrobes, wooden flooring, and custom cabinetry.',
            address: '56 Timber Road, Porur',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipcode: '600116',
            serviceArea: 'West Chennai, Porur, Guindy, Ashok Nagar',
            website: 'https://woodcraftmasters.example.com',
            yearsInBusiness: 20,
            certifications: 'Master Carpenter Guild, Quality Wood Certification',
            services: JSON.stringify(['Custom Furniture', 'Modular Kitchen', 'Wardrobe Design', 'Wood Flooring', 'Home Renovation']),
            hours: JSON.stringify({ Monday: '09:00 - 18:00', Tuesday: '09:00 - 18:00', Wednesday: '09:00 - 18:00', Thursday: '09:00 - 18:00', Friday: '09:00 - 18:00', Saturday: '10:00 - 15:00', Sunday: 'Closed' }),
            rating: 4.6,
            reviewCount: 95
        },
        {
            businessName: 'ColorPro Painting Services',
            category: 'Painting',
            email: 'quotes@colorpro.com',
            phone: '+91 98765 66666',
            description: 'Interior and exterior painting specialists delivering quality finishes with meticulous attention to detail and complete customer satisfaction. We offer color consultation, texture painting, waterproofing, wood polishing, and wallpaper installation using premium paints from top brands.',
            address: '89 Colour Street, Velachery',
            city: 'Chennai',
            state: 'Tamil Nadu',
            zipcode: '600042',
            serviceArea: 'South Chennai, Velachery, Adyar, Tambaram',
            website: 'https://colorpro.example.com',
            yearsInBusiness: 10,
            certifications: 'Asian Paints Certified Partner, Dulux Approved',
            services: JSON.stringify(['Interior Painting', 'Exterior Painting', 'Texture Painting', 'Waterproofing', 'Wood Polishing']),
            hours: JSON.stringify({ Monday: '08:00 - 18:00', Tuesday: '08:00 - 18:00', Wednesday: '08:00 - 18:00', Thursday: '08:00 - 18:00', Friday: '08:00 - 18:00', Saturday: '09:00 - 14:00', Sunday: 'Closed' }),
            rating: 4.9,
            reviewCount: 118
        }
    ];

    const insertBiz = db.prepare(`
        INSERT INTO businesses (businessName, category, email, phone, description, address, city, state, zipcode, serviceArea, website, yearsInBusiness, certifications, services, hours, rating, reviewCount)
        VALUES (@businessName, @category, @email, @phone, @description, @address, @city, @state, @zipcode, @serviceArea, @website, @yearsInBusiness, @certifications, @services, @hours, @rating, @reviewCount)
    `);

    const insertMany = db.transaction((businesses) => {
        for (const biz of businesses) insertBiz.run(biz);
    });

    insertMany(seedBusinesses);
    console.log('🌱 Seeded 6 sample businesses');
}

console.log('✅ Database initialized successfully');

module.exports = db;
