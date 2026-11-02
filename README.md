# ToolLoop — Community Equipment-Sharing Network

> A peer-to-peer equipment and tool sharing network with refundable security deposits, Razorpay UPI escrow integration, and localized community hubs.

[![GitHub Repository](https://img.shields.io/badge/GitHub-toolloop--community--equipment--sharing-emerald.svg)](https://github.com/sohel832/toolloop-community-equipment-sharing)

---

## 📁 Repository Structure

```text
toolloop-community-equipment-sharing/
├── frontend/                      # Client Application (Next.js 14 & React)
│   ├── src/
│   │   ├── app/                   # App Router pages & API route handlers
│   │   │   ├── api/               # Next.js Route Handlers (auth, payments, items, bookings)
│   │   │   ├── globals.css        # Tailwind dual theme stylesheet
│   │   │   ├── layout.jsx         # Root layout with theme anti-flicker script
│   │   │   └── page.jsx           # Main application view container
│   │   ├── components/            # Reusable React components & modals
│   │   │   ├── Navbar.jsx         # Navbar with role-specific views & theme toggle
│   │   │   ├── PaymentModal.jsx   # Razorpay UPI Escrow payment modal & QR code
│   │   │   ├── AuthPage.jsx       # Auth screen with password blink & strength check
│   │   │   ├── AdminDashboard.jsx # Admin management portal
│   │   │   ├── UserDashboard.jsx  # Member dashboard & quick stats
│   │   │   ├── BookingsList.jsx   # Equipment loan and borrow tracking
│   │   │   └── ...
│   │   └── lib/                   # Database pool & hashing utilities
│   ├── package.json               # Frontend dependencies
│   ├── tailwind.config.js         # Tailwind configuration with class-based dark mode
│   └── .env.example               # Safe environment configuration template
│
├── backend/                       # Server Application (Node.js & Express)
│   ├── src/
│   │   ├── config/                # MySQL connection pool & auto-migrations
│   │   ├── controllers/           # Business logic (auth, payments, bookings, items)
│   │   ├── routes/                # Express REST API endpoints
│   │   └── server.js              # Express server entry point
│   ├── scripts/                   # Database migrations & seed scripts
│   │   ├── schema.sql             # Relational DDL schema (8 tables)
│   │   └── seed.sql               # Seed data for demo accounts & equipment
│   ├── package.json               # Backend dependencies
│   └── .env.example               # Safe environment configuration template
│
├── .gitignore                     # Clean ignore rules (excludes node_modules & .next)
└── README.md                      # Project documentation
```

---

## 🚀 Key Features

- **Peer-to-Peer Equipment Sharing**: List and borrow tools with community accountability.
- **Razorpay UPI Escrow Payments**: Security deposits are locked in escrow and refunded when equipment is safely returned.
- **Admin Beneficiary UPI ID**: Direct UPI payments to `s9611668103@ptyes` via dynamic QR code and UPI apps (Google Pay, PhonePe, Paytm, BHIM).
- **Role-Based Experience**: Strict view separation between Platform Admins and Community Members.
- **Strong Authentication**: Show/hide password blink toggle, live password strength validation (min 5 chars, uppercase, lowercase, symbol), and secure `scrypt` hashing.
- **Dual Theme**: Responsive Light and Dark mode toggle with anti-flicker localStorage persistence.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React.js, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js REST API, Next.js Route Handlers |
| **Database** | MySQL 8.0+ (8 relational tables with auto-migration) |
| **Payments** | Razorpay UPI Escrow integration with HMAC-SHA256 signature verification |

---

## ⚡ Setup & Run

### 1. Database Setup
```bash
# Seed database tables and sample records:
cd backend
npm run seed
```

### 2. Start Backend API
```bash
cd backend
npm install
npm start
```
*API runs on `http://localhost:5000`*

### 3. Start Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
*Web application runs on `http://localhost:3000`*

---

## 👥 Authors
- **Sohel M Chapparband** ([@sohel832](https://github.com/sohel832))
- **Shreyas Bellad**
