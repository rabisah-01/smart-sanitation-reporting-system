# 🗑️ Smart Sanitation Reporting System

**BSc. CSIT, Full Stack MERN Project**
**Student:** Rabi Sah | **Supervisor:**
**College:** New Summit College (Affiliated to Tribhuvan University)

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Redux Toolkit, React Router 6, Recharts, Vite |
| Backend  | Node.js, Express.js                     |
| Database | MongoDB (NoSQL) via Mongoose             |
| Auth     | JWT (JSON Web Tokens) + bcryptjs        |
| Styling  | Pure CSS with design tokens             |

---

## Project Structure

```
smart-sanitation/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, GetMe
│   │   ├── complaintController.js   # Full CRUD + assign
│   │   └── analyticsController.js   # Dashboard stats
│   ├── db/
│   │   ├── connect.js               # Mongoose connection
│   │   └── init.js                  # DB seed script
│   ├── models/
│   │   ├── User.js                  # Mongoose schema (citizens + admins)
│   │   └── Complaint.js             # Mongoose schema (embeds assignment)
│   ├── middleware/
│   │   └── auth.js                  # JWT protect + adminOnly
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   └── analytics.js
│   ├── uploads/                     # Image uploads directory
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── store.js             # Redux store
    │   │   └── api.js               # Axios instance with interceptors
    │   ├── features/
    │   │   ├── auth/authSlice.js    # Login/Register/FetchMe thunks
    │   │   ├── complaints/complaintsSlice.js
    │   │   └── admin/adminSlice.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── Loader.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── CitizenDashboard.jsx
    │   │   ├── SubmitComplaintPage.jsx
    │   │   ├── ComplaintDetailPage.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminComplaintsPage.jsx
    │   │   └── AnalyticsPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Database Schema (MongoDB / Mongoose)

Two collections. The old relational `admins` table is merged into `users`
(admins are just users with `role: 'admin'`), and the old `assignments`
table is embedded directly inside each complaint document, since a
complaint has at most one active assignment.

```
users       { _id, name, email, password, role, department, created_at }

complaints  { _id, user_id→users, description, location, category,
              image_url, status, priority, date, updated_at,
              assignment: { assigned_to, notes, admin_id→users, assigned_at } }
```

API responses are shaped to match the original field names
(`complaint_id`, `user_id`, `citizen_name`, `assigned_to`,
`assignment_notes`, `assigned_at`, `admin_name`, …) so the React frontend
works unchanged.

---

## Setup & Run

### 1. Prerequisites
- Node.js v18+
- MongoDB 6+ (local install, or a free MongoDB Atlas cluster)

### 2. Database Setup
- **Local:** just have `mongod` running on the default port (27017) — no manual database/collection creation needed, Mongoose creates them on first write.
- **Atlas:** create a free cluster and copy its connection string.

### 3. Backend Setup
```bash
cd backend
npm install
# Create .env file
cp .env.example .env
# Edit .env and set your MONGO_URI:
# MONGO_URI=mongodb://localhost:27017/smart_sanitation
# (or an Atlas URI: mongodb+srv://user:pass@cluster.mongodb.net/smart_sanitation)
# JWT_SECRET=any_long_random_string

# Seed the database (creates demo admin + citizen + sample complaints)
npm run db:init

# Start backend server
npm run dev
# → Runs on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Start frontend dev server
npm run dev
# → Runs on http://localhost:5173
```

---

## Demo Login Credentials

| Role    | Email                        | Password  |
|---------|------------------------------|-----------|
| Admin   | admin@sanitation.gov.np      | Admin@123 |
| Citizen | rabi@citizen.com              | Admin@123 |

---

## API Endpoints

### Auth
| Method | Endpoint           | Access  | Description      |
|--------|--------------------|---------|------------------|
| POST   | /api/auth/register | Public  | Register citizen |
| POST   | /api/auth/login    | Public  | Login            |
| GET    | /api/auth/me       | Auth    | Get current user |

### Complaints
| Method | Endpoint                       | Access  | Description          |
|--------|--------------------------------|---------|----------------------|
| GET    | /api/complaints                | Auth    | List complaints      |
| POST   | /api/complaints                | Auth    | Submit complaint     |
| GET    | /api/complaints/:id            | Auth    | Get single complaint |
| PATCH  | /api/complaints/:id/status     | Admin   | Update status        |
| POST   | /api/complaints/:id/assign     | Admin   | Assign to worker     |
| DELETE | /api/complaints/:id            | Auth    | Delete complaint     |

### Analytics (Admin only)
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | /api/analytics/summary  | Dashboard stats + charts |
| GET    | /api/analytics/admins   | Admin leaderboard        |

---

## Features

### Citizen Portal
- Register / Login
- Submit sanitation complaints (description, location, category, priority, photo)
- View personal complaint history with filters
- Track complaint status in real-time
- View assignment details (who is handling their complaint)

### Admin Dashboard
- Overview stats (total, pending, in-progress, resolved, rejection rate)
- Recent complaints list
- Category breakdown with progress bars
- Monthly trend mini-chart

### Admin Complaint Management
- View ALL complaints with pagination
- Filter by status, category, priority
- Update complaint status inline (dropdown)
- Assign complaints to workers/teams with notes
- View full complaint details + photos

### Analytics Page
- KPI cards (6 key metrics)
- Monthly trend line chart
- Status breakdown donut chart
- Complaints by category bar chart
- Recent complaints table
