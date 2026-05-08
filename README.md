# GateKeeperX 🔐

> A full-stack lab resource booking & access management system for universities and research facilities. Features department-based user registration, real-time availability tracking, smart scheduling, admin control panel, and an analytics reporting dashboard. Built with React, Vite, Node.js, and MySQL.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Pages & Routing](#pages--routing)
- [Scripts](#scripts)

---

## Overview

GateKeeperX is a role-based resource management platform designed for academic institutions. It allows users to register under their respective departments, browse available lab resources, make bookings, and track their reservation history. Admins get a dedicated control panel to manage users, monitor resource usage in real-time, and handle permission requests.

---

## ✨ Features

### 👤 User
- Department-mapped self-service registration & login
- Browse available lab resources by type and department
- Book resources with date/time slot selection
- View and manage personal booking history
- Submit permission requests for restricted resources
- Dark mode support

### 🛡️ Admin
- Admin-only panel with full user management
- Monitor real-time resource availability and "In Use" status
- Approve or revoke user permission requests
- View all bookings across users and departments
- Analytics & reporting dashboard with KPI metrics
- CSV export for booking logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Vite 8 |
| Styling | Vanilla CSS, FontAwesome Icons |
| Backend | Node.js, Express 5 |
| Database | MySQL (via `mysql2`) |
| Dev Tools | Nodemon, ESLint, Vite HMR |
| Notifications | React Toastify |

---

## 📁 Project Structure

```
GateKeeperX/
├── public/                  # Static assets (SVGs, favicon)
├── server/
│   ├── controllers/         # Route handler logic
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── demoController.js
│   │   ├── permissionController.js
│   │   ├── resourceController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── errorHandler.js  # Global error & 404 handler
│   ├── routes/              # Express route definitions
│   ├── db.js                # MySQL connection pool
│   ├── index.js             # Express app entry point
│   └── seed_data.sql        # Database seed file
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── PageLayout.jsx
│   ├── context/
│   │   └── AppContext.jsx   # Global state (auth, theme, sidebar)
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BookResource.jsx
│   │   ├── MyBookings.jsx
│   │   ├── Resources.jsx
│   │   ├── AdminPanel.jsx
│   │   └── Permissions.jsx
│   ├── App.jsx              # Root component, routing, auth guards
│   ├── main.jsx
│   └── styles.css           # Global design system & CSS variables
├── .env                     # Environment variables (not committed)
├── .gitignore
├── start.bat                # One-click dev launcher (frontend + backend)
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) running locally or remotely

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yash-pratap-create/GateKeeperX.git
cd GateKeeperX

# 2. Install all dependencies
npm install

# 3. Set up your environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Create the database and seed initial data
mysql -u root -p gatekeeperx < server/seed_data.sql
```

### Running the App

**Option A — One-click launcher (Windows)**
```bash
start.bat
```
> Starts both the frontend (Vite) and backend (Node) servers and opens the browser automatically.

**Option B — Manual**
```bash
# Terminal 1 — Backend
npm run server:dev

# Terminal 2 — Frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend:  `http://localhost:5000`

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=gatekeeperx
DB_CONNECTION_LIMIT=10
```

---

## 📡 API Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/signup` | User registration |
| GET | `/departments` | Fetch all departments |

### Resources
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resources` | Get all resources |
| GET | `/resources/:id` | Get resource by ID |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get all bookings (admin) |
| GET | `/bookings/my` | Get current user's bookings |
| POST | `/bookings` | Create a new booking |
| DELETE | `/bookings/:id` | Cancel a booking |

### Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permissions` | Get all permission requests |
| POST | `/permissions` | Submit a permission request |
| PATCH | `/permissions/:id` | Approve/revoke a request |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| PATCH | `/users/:id` | Update user details |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server & DB health check |

---

## 🗺️ Pages & Routing

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login / Signup | Public |
| `/dashboard` | Overview & stats | Authenticated |
| `/book` | Book a resource | Authenticated |
| `/my-bookings` | My booking history | Authenticated |
| `/resources` | Browse all resources | Authenticated |
| `/admin` | Admin control panel | Admin only |
| `/permissions` | Manage permissions | Admin only |

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite frontend dev server |
| `npm run server` | Start backend with Node |
| `npm run server:dev` | Start backend with Nodemon (auto-reload) |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is for academic and demonstration purposes.
