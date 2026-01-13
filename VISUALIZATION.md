# 📊 Project Architecture Visualization

## 🗺️ Complete System Map

### Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER JOURNEY                             │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Browser     │
                    │  Visits App  │
                    └──────┬───────┘
                           │
                           ↓
              ┌────────────────────────┐
              │   Home Page (/)        │
              │   - Hero Section       │
              │   - Features           │
              │   - CTA: Login         │
              └────────┬───────────────┘
                       │
                       ↓ Click "Login"
                       │
              ┌────────┴───────────────┐
              │   Login Page           │
              │   - Email Field        │
              │   - Password Field     │
              │   - Role Selector      │
              │     ○ Donor            │
              │     ○ Hospital         │
              │     ○ Admin            │
              └────────┬───────────────┘
                       │
                       ↓ Submit
                       │
         ┌─────────────┴─────────────┐
         │   AuthContext.login()      │
         │   - Validate credentials   │
         │   - Create user object     │
         │   - Store in localStorage  │
         │   - Set isAuthenticated    │
         └─────────────┬──────────────┘
                       │
                       ↓ Success
                       │
            ┌──────────┴──────────┐
            │  Check user.role    │
            └──────────┬──────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ↓              ↓              ↓
   role='donor'  role='hospital'  role='admin'
        │              │              │
        ↓              ↓              ↓
┌───────────┐  ┌───────────┐  ┌───────────┐
│   Donor   │  │ Hospital  │  │   Admin   │
│ Dashboard │  │ Dashboard │  │ Dashboard │
└───────────┘  └───────────┘  └───────────┘
```

---

## 🔐 Route Protection Flow

### Multi-Layer Security Check

```
User requests: /dashboard/admin
        │
        ↓
┌───────────────────────────────────┐
│  Layer 1: ProtectedRoute Check   │
│  Question: Is user authenticated? │
└───────────┬───────────────────────┘
            │
    ┌───────┴────────┐
    │                │
   YES              NO
    │                │
    ↓                ↓
 Continue      ┌──────────────┐
    │          │ Redirect to  │
    │          │   /login     │
    │          └──────────────┘
    ↓
┌───────────────────────────────────┐
│  Layer 2: RoleRoute Check         │
│  Question: user.role === 'admin'? │
└───────────┬───────────────────────┘
            │
    ┌───────┴────────┐
    │                │
   YES              NO
    │                │
    ↓                ↓
┌──────────┐  ┌─────────────────────┐
│  Render  │  │ Redirect to correct │
│   Page   │  │ dashboard for role  │
│   ✅     │  │ (e.g., /dashboard/  │
└──────────┘  │      hospital)      │
              └─────────────────────┘
```

---

## 📦 Component Hierarchy

### Page Component Example: DonorDashboard

```
<BrowserRouter>
  │
  └─<AuthProvider>
      │
      └─<Routes>
          │
          └─<Route path="/dashboard/donor">
              │
              └─<ProtectedRoute>
                  │
                  ├─ Checks: isAuthenticated
                  │
                  └─<RoleRoute allowedRole="donor">
                      │
                      ├─ Checks: user.role === 'donor'
                      │
                      └─<DonorDashboard>
                          │
                          ├─ <DashboardLayout>
                          │   │
                          │   ├─ <Navbar />
                          │   ├─ <Sidebar />
                          │   └─ <main>
                          │
                          ├─ <StatsCard title="Donations" />
                          ├─ <StatsCard title="Last Donation" />
                          ├─ <StatsCard title="Next Eligible" />
                          │
                          ├─ <Card title="Blood Stock">
                          │   └─ <BloodStockTable />
                          │
                          └─ <Button>Book Appointment</Button>
```

---

## 🗂️ File Dependency Map

### Critical Files and Their Relationships

```
main.jsx
   │
   └─> App.jsx
         │
         └─> routes/AppRoutes.jsx
               │
               ├─> context/AuthContext.jsx
               │     │
               │     └─> Provides: isAuthenticated, user, login(), logout()
               │
               ├─> routes/ProtectedRoute.jsx
               │     │
               │     └─> Uses: useAuth() hook
               │
               ├─> routes/RoleRoute.jsx
               │     │
               │     └─> Uses: useAuth() hook
               │
               └─> pages/**/*.jsx
                     │
                     ├─> public/HomePage.jsx
                     ├─> public/LoginPage.jsx
                     │     │
                     │     └─> Uses: AuthContext.login()
                     │
                     └─> dashboard/**/[Dashboard].jsx
                           │
                           └─> Protected by ProtectedRoute + RoleRoute
```

---

## 🎭 Role-Based Access Matrix

| Route | Public | Donor | Hospital | Admin |
|-------|--------|-------|----------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/login` | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/donor` | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/donor/profile` | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/donor/history` | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/donor/book-appointment` | ❌ | ✅ | ❌ | ❌ |
| `/dashboard/hospital` | ❌ | ❌ | ✅ | ❌ |
| `/dashboard/hospital/stock` | ❌ | ❌ | ✅ | ❌ |
| `/dashboard/hospital/request` | ❌ | ❌ | ✅ | ❌ |
| `/dashboard/hospital/history` | ❌ | ❌ | ✅ | ❌ |
| `/dashboard/admin` | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/donors` | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/hospitals` | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/inventory` | ❌ | ❌ | ❌ | ✅ |
| `/dashboard/admin/reports` | ❌ | ❌ | ❌ | ✅ |

**Legend**: ✅ Allowed | ❌ Redirected to appropriate dashboard

---

## 🔄 Authentication State Flow

### Login Flow (Detailed)

```
┌──────────────────────────────────────────────────────────┐
│ Step 1: User fills login form                           │
│   • Email: donor@example.com                            │
│   • Password: ********                                  │
│   • Role: Donor (selected)                              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ Submit
┌──────────────────────────────────────────────────────────┐
│ Step 2: LoginPage calls login({ email, password, role })│
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: AuthContext.login()                             │
│   • Validates fields exist                              │
│   • Creates user object:                                │
│     {                                                    │
│       id: 'user_1234567890',                            │
│       name: 'donor',                                    │
│       email: 'donor@example.com',                       │
│       role: 'donor'                                     │
│     }                                                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: Store user in localStorage                      │
│   localStorage.setItem('bloodDonationUser', userData)   │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: Update AuthContext state                        │
│   • setUser(userData)                                   │
│   • setIsAuthenticated(true)                            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 6: React Router detects state change               │
│   • ProtectedRoute sees isAuthenticated = true          │
│   • RoleRoute sees user.role = 'donor'                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 7: Navigate to /dashboard/donor                    │
│   • DonorDashboard rendered                             │
│   • User sees their dashboard                           │
└──────────────────────────────────────────────────────────┘
```

### Logout Flow

```
┌──────────────────────────────────────────────────────────┐
│ Step 1: User clicks "Logout" in Navbar                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 2: Navbar calls logout()                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 3: AuthContext.logout()                            │
│   • localStorage.removeItem('bloodDonationUser')        │
│   • setUser(null)                                       │
│   • setIsAuthenticated(false)                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 4: ProtectedRoute detects !isAuthenticated         │
│   • Returns <Navigate to="/login" />                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────┐
│ Step 5: User redirected to /login                       │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Tree (Complete)

```
blood-donation-system/
│
├── public/
│   ├── vite.svg
│   └── images/                   (to be added)
│
├── src/
│   │
│   ├── assets/
│   │   ├── images/               ✅ Created (empty)
│   │   └── icons/                ✅ Created (empty)
│   │
│   ├── components/
│   │   ├── common/               ✅ Created (empty, planned)
│   │   │   ├── Navbar.jsx        ⏳ To build
│   │   │   ├── Footer.jsx        ⏳ To build
│   │   │   ├── Button.jsx        ⏳ To build
│   │   │   ├── Card.jsx          ⏳ To build
│   │   │   ├── Input.jsx         ⏳ To build
│   │   │   ├── Modal.jsx         ⏳ To build
│   │   │   └── Loader.jsx        ⏳ To build
│   │   │
│   │   ├── layout/               ✅ Created (empty, planned)
│   │   │   ├── DashboardLayout.jsx  ⏳ To build
│   │   │   └── PublicLayout.jsx     ⏳ To build
│   │   │
│   │   └── dashboard/            ✅ Created (empty, planned)
│   │       ├── StatsCard.jsx        ⏳ To build
│   │       ├── BloodStockTable.jsx  ⏳ To build
│   │       ├── RequestCard.jsx      ⏳ To build
│   │       └── DonorCard.jsx        ⏳ To build
│   │
│   ├── pages/
│   │   │
│   │   ├── public/
│   │   │   ├── HomePage.jsx           ✅ Placeholder
│   │   │   ├── LoginPage.jsx          ✅ Placeholder
│   │   │   └── NotFoundPage.jsx       ✅ Placeholder
│   │   │
│   │   └── dashboard/
│   │       │
│   │       ├── donor/
│   │       │   ├── DonorDashboard.jsx       ✅ Placeholder
│   │       │   ├── DonorProfile.jsx         ✅ Placeholder
│   │       │   ├── DonationHistory.jsx      ✅ Placeholder
│   │       │   └── AppointmentBooking.jsx   ✅ Placeholder
│   │       │
│   │       ├── hospital/
│   │       │   ├── HospitalDashboard.jsx    ✅ Placeholder
│   │       │   ├── BloodStock.jsx           ✅ Placeholder
│   │       │   ├── RequestBlood.jsx         ✅ Placeholder
│   │       │   └── RequestHistory.jsx       ✅ Placeholder
│   │       │
│   │       └── admin/
│   │           ├── AdminDashboard.jsx       ✅ Placeholder
│   │           ├── ManageDonors.jsx         ✅ Placeholder
│   │           ├── ManageHospitals.jsx      ✅ Placeholder
│   │           ├── BloodInventory.jsx       ✅ Placeholder
│   │           └── Reports.jsx              ✅ Placeholder
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx               ✅ Complete
│   │   ├── ProtectedRoute.jsx          ✅ Complete
│   │   └── RoleRoute.jsx               ✅ Complete
│   │
│   ├── context/
│   │   └── AuthContext.jsx             ✅ Complete
│   │
│   ├── hooks/
│   │   └── useAuth.js                  ✅ Complete
│   │
│   ├── utils/                          ✅ Created (empty)
│   ├── styles/                         ✅ Created (empty)
│   │
│   ├── App.jsx                         ✅ Updated
│   ├── App.css                         ✅ Exists
│   └── main.jsx                        ✅ Exists
│
├── index.html                          ✅ SEO optimized
├── package.json                        ✅ Dependencies installed
├── vite.config.js                      ✅ Default config
├── eslint.config.js                    ✅ Default config
│
├── ARCHITECTURE.md                     ✅ Complete guide
├── ROUTING.md                          ✅ Complete guide
├── COMPONENTS.md                       ✅ Complete guide
├── QUICKSTART.md                       ✅ Complete guide
├── VISUALIZATION.md                    ✅ This file
└── README.md                           ✅ Complete
```

**Legend**:
- ✅ Complete/Created
- ⏳ Planned (not yet built)

---

## 📊 Component Count Summary

### Files Created: 25

**Routing System**: 3 files
- AppRoutes.jsx
- ProtectedRoute.jsx
- RoleRoute.jsx

**Context & Hooks**: 2 files
- AuthContext.jsx
- useAuth.js

**Page Components**: 16 files
- Public pages: 3
- Donor pages: 4
- Hospital pages: 4
- Admin pages: 5

**Core Files**: 2 files
- App.jsx (updated)
- index.html (updated)

**Documentation**: 5 files
- ARCHITECTURE.md
- ROUTING.md
- COMPONENTS.md
- QUICKSTART.md
- README.md
- VISUALIZATION.md (this file)

### Components Planned (Not Built): 14

**Common**: 7 components
**Layout**: 2 components
**Dashboard**: 4 components
**Pages**: 16 (will replace placeholders)

---

## 🎯 Development Phases

### Phase 1: Foundation ✅ (COMPLETE)
```
[████████████████████████████] 100%
```
- Project setup
- Routing architecture
- Authentication system
- Documentation

### Phase 2: Design System ⏳ (NEXT)
```
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```
- CSS variables
- Typography
- Color system
- Spacing utilities

### Phase 3: Common Components ⏳
```
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```
- Button, Card, Input
- Modal, Navbar, Footer

### Phase 4: Layouts ⏳
```
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```
- PublicLayout
- DashboardLayout

### Phase 5: Page UIs ⏳
```
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```
- HomePage, LoginPage
- All Dashboards

### Phase 6: Polish ⏳
```
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%
```
- Animations
- Responsive design
- Optimization

---

## 🔍 Quick Navigation Guide

**Want to understand routing?**  
→ Read `ROUTING.md`

**Want to see folder structure?**  
→ Read `ARCHITECTURE.md`

**Want to build components?**  
→ Read `COMPONENTS.md`

**Want to get started quickly?**  
→ Read `QUICKSTART.md`

**Want visual diagrams?**  
→ You're here! `VISUALIZATION.md`

**Want project overview?**  
→ Read `README.md`

---

**Architecture Foundation: 100% Complete** ✅  
**UI Development: Ready to Begin** 🚀
