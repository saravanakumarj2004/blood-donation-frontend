# 🩸 Blood Donation Stock Management System

> A modern, responsive, and SEO-optimized web application for managing city/district-level blood donation operations.

![React](https://img.shields.io/badge/React-18.3-blue.svg)
![React Router](https://img.shields.io/badge/React_Router-v6-red.svg)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Documentation](#documentation)
- [Roadmap](#roadmap)

---

## 🌟 Overview

The **Blood Donation Stock Management System** is a healthcare web application designed for city/district-level blood donation management. It connects **Donors**, **Hospitals**, and **Administrators** on a centralized platform to streamline blood stock tracking, donation scheduling, and blood request management.

### Purpose
- Manual data entry-based system (NOT live hospital integration)
- Localhost deployment for prototyping
- Modern SaaS-style healthcare UI
- Role-based access control

---

## ✨ Features

### 🎯 Core Features
- ✅ **Role-Based Dashboards** - Separate interfaces for Donors, Hospitals, and Admins
- ✅ **Protected Routing** - Secure authentication and authorization
- ✅ **Blood Stock Management** - Real-time inventory tracking by blood type
- ✅ **Donation Scheduling** - Donors can book appointments
- ✅ **Request Management** - Hospitals can request blood from inventory
- ✅ **User Management** - Admins can manage donors and hospitals
- ✅ **SEO Optimized** - Meta tags, semantic HTML, structured data
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### 🎨 UI/UX Features
- Clean healthcare SaaS design
- Blood red primary color scheme
- Rounded cards with smooth shadows
- Hover effects and micro-interactions
- Professional medical imagery
- Modern typography (Inter, Roboto)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 18.3 |
| **Build Tool** | Vite (Fast, modern bundler) |
| **Routing** | React Router v6 |
| **Styling** | CSS Modules + Custom CSS |
| **State Management** | React Context API |
| **Authentication** | Simulated (localStorage-based) |
| **Deployment** | Localhost only |
| **Cost** | 100% Free tools |

---

## 🏗 Architecture

### Application Flow

```
┌──────────────┐
│  Home Page   │  Public landing page
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Login Page  │  Role-based authentication
└──────┬───────┘
       │
       ↓
  ┌────┴────┐
  │  Role?  │
  └────┬────┘
       │
   ┌───┼────┬────────┐
   │   │    │        │
   ↓   ↓    ↓        ↓
 Donor Hospital   Admin
Dashboard Dashboard Dashboard
```

### Route Protection

1. **Public Routes**: `/`, `/login` - No authentication required
2. **Protected Routes**: All `/dashboard/*` - Requires login
3. **Role Routes**: Specific dashboards - Requires matching role

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project**:
```bash
cd blood-donation-system
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run development server**:
```bash
npm run dev
```

4. **Open in browser**:
```
http://localhost:5173
```

### Default Login Credentials (Simulated)

Since this is a prototype with simulated authentication, you can login with any credentials:

**Donor Login**:
- Email: `donor@example.com`
- Password: `password`
- Role: Select "Donor"

**Hospital Login**:
- Email: `hospital@example.com`
- Password: `password`
- Role: Select "Hospital"

**Admin Login**:
- Email: `admin@example.com`
- Password: `password`
- Role: Select "Admin"

> ⚠️ **Note**: Authentication is simulated for localhost prototyping. In production, implement real backend authentication.

---

## 📁 Project Structure

```
blood-donation-system/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, icons, fonts
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Buttons, Cards, Inputs, etc.
│   │   ├── layout/          # Layouts (Dashboard, Public)
│   │   └── dashboard/       # Dashboard-specific components
│   ├── pages/               # Page components (Routes)
│   │   ├── public/          # Public pages (Home, Login)
│   │   └── dashboard/       # Protected dashboards
│   │       ├── donor/       # Donor pages
│   │       ├── hospital/    # Hospital pages
│   │       └── admin/       # Admin pages
│   ├── routes/              # Routing configuration
│   │   ├── AppRoutes.jsx    # Main route definitions
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── context/             # React Context (Auth, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   ├── styles/              # Global CSS
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── index.html               # HTML template (SEO tags)
├── vite.config.js           # Vite configuration
├── package.json
├── ARCHITECTURE.md          # Architecture documentation
├── ROUTING.md               # Routing documentation
├── COMPONENTS.md            # Component documentation
└── README.md                # This file
```

---

## 👥 User Roles

### 1. 🩸 Donor
**Dashboard**: `/dashboard/donor`

**Capabilities**:
- View donation statistics
- Book blood donation appointments
- View donation history
- Update personal profile
- Check blood stock availability

**Cannot Access**: Hospital or Admin features

---

### 2. 🏥 Hospital
**Dashboard**: `/dashboard/hospital`

**Capabilities**:
- View blood stock levels
- Request blood from inventory
- Track request history
- Update hospital profile

**Cannot Access**: Donor or Admin features

---

### 3. 👨‍💼 Admin
**Dashboard**: `/dashboard/admin`

**Capabilities**:
- Manage all donors (CRUD operations)
- Manage all hospitals (CRUD operations)
- Update blood inventory system-wide
- Generate reports and analytics
- Full system access

**Full Access**: All features

---

## 📚 Documentation

Comprehensive documentation is available:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Complete system architecture, design system, folder structure |
| [ROUTING.md](./ROUTING.md) | Routing strategy, route protection explained, authentication flow |
| [COMPONENTS.md](./COMPONENTS.md) | Component structure, props, usage examples |

---

## 🎯 Current Status

### ✅ Completed (Foundation)
- [x] React project setup with Vite
- [x] React Router v6 installation
- [x] Complete folder structure
- [x] Routing configuration (public, protected, role-based)
- [x] Route protection components (`ProtectedRoute`, `RoleRoute`)
- [x] Authentication context (`AuthContext`)
- [x] Custom hooks (`useAuth`)
- [x] Placeholder page components (all routes)
- [x] SEO-optimized HTML (meta tags, structured data)
- [x] Comprehensive documentation

### ⏳ Next Steps (UI Development)
- [ ] Design system (CSS variables, utility classes)
- [ ] Common components (Button, Card, Input, Modal, etc.)
- [ ] Layout components (DashboardLayout, PublicLayout)
- [ ] Dashboard components (StatsCard, BloodStockTable, etc.)
- [ ] Page UIs (Home, Login, Dashboards)
- [ ] Animations and micro-interactions
- [ ] Responsive design implementation
- [ ] Testing and optimization

---

## 🛣 Roadmap

### Phase 1: Foundation ✅ (CURRENT)
- Setup project architecture
- Configure routing and protection
- Document system design

### Phase 2: UI Development (NEXT)
- Build design system
- Create reusable components
- Implement page layouts

### Phase 3: Features & Functionality
- Implement business logic
- Add form validation
- Integrate data management

### Phase 4: Polish & Optimization
- Add animations
- Optimize performance
- Improve accessibility
- Final testing

### Phase 5: Backend Integration (Future)
- Connect to real API
- Implement JWT authentication
- Database integration
- Deploy to production

---

## 🎨 Design System

### Color Palette
- **Primary Red**: `#DC143C` - Blood red for primary actions
- **Secondary Blue**: `#E8F4F8` - Light blue backgrounds
- **Neutral Colors**: Dark gray text, light borders

### Typography
- **Headings**: Inter, Segoe UI (600)
- **Body**: Roboto, Arial (400)

### Spacing
- XS: 4px, S: 8px, M: 16px, L: 24px, XL: 32px

### Border Radius
- Small: 8px, Medium: 12px, Large: 16px

---

## 🔒 Security Notes

### Current (Localhost Prototype)
- ⚠️ Simulated authentication (no real backend)
- ⚠️ Client-side route protection only
- ⚠️ Data stored in localStorage
- ⚠️ For demonstration purposes only

### Production Requirements
For real-world deployment, implement:
- ✅ Backend API with database
- ✅ JWT or session-based authentication
- ✅ Password hashing (bcrypt)
- ✅ HTTPS encryption
- ✅ Server-side validation
- ✅ CSRF protection
- ✅ Rate limiting

---

## 🤝 Contributing

This is a prototype project. Future contributions welcome for:
- UI/UX improvements
- Additional features
- Backend integration
- Testing coverage

---

## 📄 License

MIT License - Free to use for educational and commercial purposes.

---

## 📞 Support

For questions or issues, please refer to the documentation files:
- Architecture questions → `ARCHITECTURE.md`
- Routing questions → `ROUTING.md`
- Component questions → `COMPONENTS.md`

---

## 🙏 Acknowledgments

Built with:
- React.js - UI framework
- Vite - Build tool
- React Router - Routing library

---

**Made with ❤️ for Healthcare**

*Saving lives, one donation at a time.* 🩸
