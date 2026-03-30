# LocalConnect

Website currently live at - https://web-dev-project-localconnect.onrender.com/

A full-stack local service directory platform where customers can discover trusted service professionals in their area, and businesses can list and manage their services.

Built with Node.js, Express, and SQLite.

---

## Features

- **Role-based accounts** -- separate sign-up and sign-in flows for Customers and Businesses
- **Business listings** -- create, edit, and delete listings with photos, hours, and contact info
- **Search and filtering** -- search by keyword, category, rating, with sorting and pagination
- **Review system** -- customers can rate and review businesses
- **Business dashboard** -- business owners can manage all their listings from one place
- **Responsive design** -- works across desktop and mobile

---

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Backend    | Node.js, Express 5           |
| Database   | SQLite (via better-sqlite3)  |
| Auth       | express-session, bcryptjs    |
| Uploads    | multer                       |
| Frontend   | HTML, CSS, vanilla JS        |
| Icons      | Font Awesome 6               |

---

## Project Structure

```
localconnect/
  server/
    server.js          -- Express server entry point
    database.js        -- SQLite schema, seeding, and initialization
    routes/
      auth.js          -- Signup, signin, logout, session check
      business.js      -- Listing CRUD, photo uploads, reviews
      contact.js       -- Contact form submissions
    uploads/           -- Uploaded business photos
  index.html           -- Homepage
  services.html        -- Service listings with search/filter
  business-listing.html-- Create/edit business listing form
  business-profile.html-- Individual business profile + reviews
  my-listings.html     -- Business owner dashboard
  signin.html          -- Sign in page
  signup.html          -- Sign up page
  styles.css           -- Global stylesheet
  auth-state.js        -- Shared auth state and navbar management
  script-*.js          -- Page-specific scripts
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
git clone <repo-url>
cd localconnect
npm install
```

### Run the server

```bash
npm start
```

The app starts at **http://localhost:3000**.

The database is created automatically on first run and seeded with sample data.

---

## API Routes

### Auth

| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| POST   | /api/auth/signup  | Create a new account   |
| POST   | /api/auth/signin  | Sign in                |
| GET    | /api/auth/me      | Get current user       |
| POST   | /api/auth/logout  | End session            |

### Business

| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | /api/business/listings                | List all (with filters)      |
| GET    | /api/business/listing/:id             | Get single listing           |
| POST   | /api/business/listing                 | Create listing (auth)        |
| PUT    | /api/business/listing/:id             | Update listing (owner only)  |
| DELETE | /api/business/listing/:id             | Delete listing (owner only)  |
| GET    | /api/business/my-listings             | Get own listings (auth)      |
| GET    | /api/business/listing/:id/reviews     | Get reviews for a listing    |
| POST   | /api/business/listing/:id/review      | Submit a review (auth)       |

### Contact

| Method | Endpoint          | Description               |
|--------|-------------------|---------------------------|
| POST   | /api/contact      | Submit a contact message  |

---

## Database

SQLite database (`server/localconnect.db`) with five tables:

| Table              | Purpose                          |
|--------------------|----------------------------------|
| users              | Customer and business accounts   |
| businesses         | Business listings                |
| business_photos    | Uploaded photos per listing      |
| reviews            | Customer ratings and comments    |
| contact_messages   | Contact form submissions         |

Auto-seeds with 6 sample businesses on first run if the database is empty.

---

## Default Test Accounts

Created via the sign-up page. No hardcoded test credentials -- register a new account to get started.

---

## License

MIT
