# Blood Donation Stock Management System - Architecture Documentation

## 📋 Project Overview
A city/district-level Blood Donation Stock Management System built with React.js, featuring role-based dashboards for Donors, Hospitals, and Admins. This is a manual data entry system, NOT a live hospital integration.

## 🛠 Tech Stack
- **Frontend Framework**: React.js 18+
- **Build Tool**: Vite (Fast, modern, optimized)
- **Routing**: React Router v6
- **Styling**: CSS Modules + Custom CSS
- **Deployment**: Localhost only
- **Cost**: 100% Free tools

## 🎨 Design System

### Color Palette
```css
--primary-red: #DC143C        /* Blood red - Primary actions, headers */
--primary-red-dark: #B01030   /* Hover states */
--primary-red-light: #FF6B8A  /* Accents, badges */

--secondary-white: #FFFFFF    /* Backgrounds, cards */
--secondary-blue: #E8F4F8     /* Light blue backgrounds */
--secondary-blue-dark: #4A90A4 /* Secondary buttons */

--neutral-dark: #2C3E50       /* Text, headings */
--neutral-gray: #7F8C8D       /* Secondary text */
--neutral-light: #ECF0F1      /* Borders, dividers */

--success-green: #27AE60      /* Success states */
--warning-yellow: #F39C12     /* Warnings */
--error-red: #E74C3C          /* Errors */
```

### Typography
- **Headings**: 'Inter', 'Segoe UI', sans-serif (Bold, 600)
- **Body**: 'Roboto', 'Arial', sans-serif (Regular, 400)
- **Code/Data**: 'Courier New', monospace

### Spacing System
- XS: 4px, S: 8px, M: 16px, L: 24px, XL: 32px, XXL: 48px

### Border Radius
- Small: 8px, Medium: 12px, Large: 16px, XLarge: 24px

### Shadows
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 8px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
--shadow-hover: 0 12px 24px rgba(220,20,60,0.2);
```

## 📁 Project Folder Structure

```
blood-donation-system/
├── public/
│   ├── favicon.ico
│   └── images/                    # Static images
│       ├── logo.png
│       ├── hero-blood-donation.jpg
│       └── illustrations/
│
├── src/
│   ├── assets/                    # Images, icons, fonts
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/                # Reusable UI components
│   │   ├── common/                # Shared across all pages
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   │
│   │   └── dashboard/             # Dashboard-specific components
│   │       ├── StatsCard.jsx
│   │       ├── BloodStockTable.jsx
│   │       ├── RequestCard.jsx
│   │       └── DonorCard.jsx
│   │
│   ├── pages/                     # Page components (Route components)
│   │   ├── public/                # Public pages (no auth required)
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   └── dashboard/             # Protected dashboard pages
│   │       ├── donor/
│   │       │   ├── DonorDashboard.jsx
│   │       │   ├── DonorProfile.jsx
│   │       │   ├── DonationHistory.jsx
│   │       │   └── AppointmentBooking.jsx
│   │       │
│   │       ├── hospital/
│   │       │   ├── HospitalDashboard.jsx
│   │       │   ├── BloodStock.jsx
│   │       │   ├── RequestBlood.jsx
│   │       │   └── RequestHistory.jsx
│   │       │
│   │       └── admin/
│   │           ├── AdminDashboard.jsx
│   │           ├── ManageDonors.jsx
│   │           ├── ManageHospitals.jsx
│   │           ├── BloodInventory.jsx
│   │           └── Reports.jsx
│   │
│   ├── routes/                    # Routing configuration
│   │   ├── AppRoutes.jsx          # Main routing setup
│   │   ├── ProtectedRoute.jsx     # Route protection wrapper
│   │   └── RoleRoute.jsx          # Role-based route protection
│   │
│   ├── context/                   # React Context API
│   │   ├── AuthContext.jsx        # Authentication state management
│   │   └── ThemeContext.jsx       # Theme state (optional)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.js             # Authentication hook
│   │   └── useLocalStorage.js     # LocalStorage management
│   │
│   ├── utils/                     # Utility functions
│   │   ├── helpers.js             # General helper functions
│   │   └── constants.js           # App constants
│   │
│   ├── styles/                    # Global styles
│   │   ├── global.css             # Global CSS variables, resets
│   │   ├── layout.css             # Layout utilities
│   │   └── animations.css         # Reusable animations
│   │
│   ├── App.jsx                    # Root component
│   ├── App.css                    # Root component styles
│   └── main.jsx                   # Entry point
│
├── index.html                     # HTML template
├── package.json
├── vite.config.js
└── README.md
```

## 🔄 Application Flow

```
┌─────────────┐
│  Home Page  │  (Public - Everyone can access)
└──────┬──────┘
       │
       ↓ Click "Login" or "Get Started"
       │
┌──────┴──────┐
│ Login Page  │  (Public - Enter credentials)
└──────┬──────┘
       │
       ↓ Submit credentials
       │
┌──────┴──────────────────┐
│  Authentication Check   │
└──────┬──────────────────┘
       │
       ↓ Success
       │
   ┌───┴────┐
   │ Role?  │
   └───┬────┘
       │
   ┌───┼───┬─────────────┐
   │   │   │             │
   ↓   ↓   ↓             ↓
Donor Hospital       Admin
   │   │   │             │
   ↓   ↓   ↓             ↓
┌──┴───┴───┴─────────────┴──┐
│   Role-Based Dashboard    │
│   (Protected - Auth Only)  │
└────────────────────────────┘
```

## 🛣 Routing Strategy (React Router v6)

### Route Structure

```jsx
/ (Root)
├── / → HomePage (Public)
├── /login → LoginPage (Public)
│
└── /dashboard (Protected)
    ├── /donor → DonorDashboard (Role: Donor)
    │   ├── /profile
    │   ├── /history
    │   └── /book-appointment
    │
    ├── /hospital → HospitalDashboard (Role: Hospital)
    │   ├── /stock
    │   ├── /request
    │   └── /history
    │
    └── /admin → AdminDashboard (Role: Admin)
        ├── /donors
        ├── /hospitals
        ├── /inventory
        └── /reports
```

### Route Types

1. **Public Routes**: Accessible without authentication
   - Home Page (`/`)
   - Login Page (`/login`)

2. **Protected Routes**: Requires authentication
   - All dashboard routes (`/dashboard/*`)

3. **Role-Based Routes**: Requires specific user role
   - Donor routes (`/dashboard/donor/*`)
   - Hospital routes (`/dashboard/hospital/*`)
   - Admin routes (`/dashboard/admin/*`)

## 🔐 Route Protection Concept

### 1. Protected Route Wrapper
**Purpose**: Prevent unauthenticated users from accessing dashboards

**How it works**:
```
User tries to access /dashboard/donor
    ↓
ProtectedRoute checks: Is user logged in?
    ↓
YES → Render the DonorDashboard
NO  → Redirect to /login
```

**Implementation Concept**:
- A wrapper component that checks authentication state
- Uses React Router's `Navigate` component for redirection
- Checks if user token exists in localStorage/context
- If authenticated: render child component
- If not authenticated: redirect to `/login`

### 2. Role-Based Route Protection
**Purpose**: Ensure users only access dashboards for their role

**How it works**:
```
Logged-in Hospital user tries to access /dashboard/admin
    ↓
RoleRoute checks: Does user have 'admin' role?
    ↓
NO  → Redirect to their own dashboard (/dashboard/hospital)
YES → Render AdminDashboard
```

**Implementation Concept**:
- Extends ProtectedRoute with role validation
- Checks user role from authentication context
- Compares required role with user's actual role
- If role matches: render component
- If role doesn't match: redirect to appropriate dashboard
- Prevents privilege escalation

### 3. Authentication Context
**Purpose**: Centralized authentication state management

**What it provides**:
```javascript
{
  isAuthenticated: boolean,      // Is user logged in?
  user: {                        // User details
    id: string,
    name: string,
    email: string,
    role: 'donor' | 'hospital' | 'admin'
  },
  login: (credentials) => {},    // Login function
  logout: () => {}               // Logout function
}
```

### 4. Login Flow
```
1. User enters credentials on LoginPage
2. Submit → Validate credentials (frontend validation only for now)
3. Success → Store user data + token in localStorage
4. Update AuthContext with user info
5. Redirect to role-specific dashboard:
   - donor → /dashboard/donor
   - hospital → /dashboard/hospital
   - admin → /dashboard/admin
```

### 5. Logout Flow
```
1. User clicks "Logout" in dashboard
2. Clear localStorage (remove token + user data)
3. Update AuthContext (isAuthenticated = false)
4. Redirect to HomePage (/)
```

### 6. Security Notes (Manual System)
Since this is a **localhost manual system** with **no backend**:
- Authentication is simulated (hardcoded credentials)
- Tokens stored in localStorage
- Role checking happens client-side only
- This is for demonstration/prototype purposes

**In production**, you would need:
- Backend API for authentication
- Secure token storage (HttpOnly cookies)
- Server-side role validation
- JWT or session-based auth
- Password hashing

## 🎯 User Roles & Permissions

### 1. Donor
**Access**: `/dashboard/donor/*`
**Can do**:
- View personal dashboard
- See donation history
- Book appointments
- Update profile
- View blood stock availability

**Cannot do**:
- Access hospital or admin features
- Modify blood inventory
- Approve requests

### 2. Hospital
**Access**: `/dashboard/hospital/*`
**Can do**:
- View hospital dashboard
- Check blood stock levels
- Request blood from inventory
- View request history
- Update hospital profile

**Cannot do**:
- Access donor or admin features
- Manually edit stock levels (admin only)
- Manage other hospitals

### 3. Admin
**Access**: `/dashboard/admin/*`
**Can do**:
- View all system data
- Manage donors (add, edit, remove)
- Manage hospitals (add, edit, remove)
- Update blood inventory
- Generate reports
- View all requests and donations
- System configuration

**Cannot do**:
- Actually, admin has full access to everything

## 📊 Component Architecture

### Reusable Components
- **Common**: Buttons, Cards, Inputs, Modals (used everywhere)
- **Layout**: DashboardLayout, PublicLayout (page wrappers)
- **Dashboard**: Stats cards, tables, charts (dashboard-specific)

### Page Components
- **Public Pages**: Static/marketing pages
- **Dashboard Pages**: Interactive, data-driven pages

### Smart vs Presentational
- **Smart Components** (pages): Handle state, logic, data
- **Presentational Components** (components): Receive props, render UI

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📝 Next Steps (After Architecture)
1. ✅ Setup complete project structure
2. ✅ Install dependencies
3. ⏳ Create design system (CSS variables)
4. ⏳ Build reusable components
5. ⏳ Implement routing and protection
6. ⏳ Create page layouts
7. ⏳ Build dashboard UIs
8. ⏳ Add animations and polish
9. ⏳ SEO optimization
10. ⏳ Testing and deployment

---

**Built with ❤️ for Healthcare**
