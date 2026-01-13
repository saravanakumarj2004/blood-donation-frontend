# Routing Architecture - Blood Donation System

## 📚 Table of Contents
1. [Overview](#overview)
2. [Route Structure](#route-structure)
3. [Route Protection Explained](#route-protection-explained)
4. [Component Mapping](#component-mapping)
5. [Authentication Flow](#authentication-flow)
6. [How to Add New Routes](#how-to-add-new-routes)

---

## Overview

This application uses **React Router v6** for client-side routing. The routing system implements:

✅ **Public Routes** - Accessible to everyone  
✅ **Protected Routes** - Requires authentication  
✅ **Role-Based Routes** - Requires specific user role  

---

## Route Structure

### Complete Route Map

```
/                              → HomePage (Public)
/login                         → LoginPage (Public)
/dashboard                     → Redirects to role-based dashboard

/dashboard/donor               → DonorDashboard (Protected + Role: donor)
  ├── /profile                 → DonorProfile
  ├── /history                 → DonationHistory
  └── /book-appointment        → AppointmentBooking

/dashboard/hospital            → HospitalDashboard (Protected + Role: hospital)
  ├── /stock                   → BloodStock
  ├── /request                 → RequestBlood
  └── /history                 → RequestHistory

/dashboard/admin               → AdminDashboard (Protected + Role: admin)
  ├── /donors                  → ManageDonors
  ├── /hospitals               → ManageHospitals
  ├── /inventory               → BloodInventory
  └── /reports                 → Reports

/*                             → NotFoundPage (404)
```

---

## Route Protection Explained

### 1️⃣ Public Routes
**What**: Routes accessible without authentication  
**Who**: Anyone (logged in or not)  
**Examples**: Home page, Login page  

**How it works**:
```
User visits /login
  ↓
No authentication check
  ↓
Render LoginPage directly
```

**Implementation**:
```jsx
<Route path="/login" element={<LoginPage />} />
```

---

### 2️⃣ Protected Routes
**What**: Routes requiring user to be logged in  
**Who**: Any authenticated user (any role)  
**Examples**: All dashboard routes  

**How it works**:
```
User visits /dashboard/donor
  ↓
ProtectedRoute checks: isAuthenticated?
  ↓
YES → Render DonorDashboard
NO  → Redirect to /login
```

**Implementation**:
```jsx
<Route
  path="/dashboard/donor"
  element={
    <ProtectedRoute>
      <DonorDashboard />
    </ProtectedRoute>
  }
/>
```

**ProtectedRoute Component Logic**:
```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

---

### 3️⃣ Role-Based Routes
**What**: Routes requiring specific user role  
**Who**: Authenticated users with matching role  
**Examples**: Donor-only, Hospital-only, Admin-only pages  

**How it works**:
```
Hospital user visits /dashboard/admin
  ↓
ProtectedRoute checks: isAuthenticated? → YES
  ↓
RoleRoute checks: user.role === 'admin'? → NO
  ↓
Redirect to /dashboard/hospital (their dashboard)
```

**Implementation**:
```jsx
<Route
  path="/dashboard/admin"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRole="admin">
        <AdminDashboard />
      </RoleRoute>
    </ProtectedRoute>
  }
/>
```

**RoleRoute Component Logic**:
```javascript
const RoleRoute = ({ allowedRole, children }) => {
  const { user } = useAuth();
  
  const roleDashboards = {
    donor: '/dashboard/donor',
    hospital: '/dashboard/hospital',
    admin: '/dashboard/admin',
  };
  
  if (user.role !== allowedRole) {
    const userDashboard = roleDashboards[user.role] || '/';
    return <Navigate to={userDashboard} replace />;
  }
  
  return children;
};
```

---

## Component Mapping

### Files and Their Purposes

| File | Purpose |
|------|---------|
| `src/routes/AppRoutes.jsx` | Main routing configuration, defines all routes |
| `src/routes/ProtectedRoute.jsx` | Wrapper to enforce authentication |
| `src/routes/RoleRoute.jsx` | Wrapper to enforce role-based access |
| `src/context/AuthContext.jsx` | Global authentication state management |
| `src/hooks/useAuth.js` | Custom hook to access auth context |

### Page Components

**Public Pages** (`src/pages/public/`):
- `HomePage.jsx` - Landing page with hero, features, CTA
- `LoginPage.jsx` - Login form with role selection
- `NotFoundPage.jsx` - 404 error page

**Donor Pages** (`src/pages/dashboard/donor/`):
- `DonorDashboard.jsx` - Main donor dashboard
- `DonorProfile.jsx` - View/edit profile
- `DonationHistory.jsx` - Past donation records
- `AppointmentBooking.jsx` - Schedule donations

**Hospital Pages** (`src/pages/dashboard/hospital/`):
- `HospitalDashboard.jsx` - Main hospital dashboard
- `BloodStock.jsx` - View available blood stock
- `RequestBlood.jsx` - Request blood from inventory
- `RequestHistory.jsx` - View past requests

**Admin Pages** (`src/pages/dashboard/admin/`):
- `AdminDashboard.jsx` - System overview dashboard
- `ManageDonors.jsx` - CRUD operations for donors
- `ManageHospitals.jsx` - CRUD operations for hospitals
- `BloodInventory.jsx` - Manage system-wide blood stock
- `Reports.jsx` - Analytics and reporting

---

## Authentication Flow

### Login Process

```
1. User opens /login
   ↓
2. Enters email, password, and selects role
   ↓
3. Clicks "Login" button
   ↓
4. login() function in AuthContext is called
   ↓
5. Credentials validated (simulated - no backend)
   ↓
6. User object created:
   {
     id: 'user_123',
     name: 'John Doe',
     email: 'john@hospital.com',
     role: 'hospital'
   }
   ↓
7. User stored in localStorage
   ↓
8. AuthContext updates:
   - isAuthenticated = true
   - user = {userData}
   ↓
9. Redirect based on role:
   - donor    → /dashboard/donor
   - hospital → /dashboard/hospital
   - admin    → /dashboard/admin
```

### Session Persistence

**On App Load** (`AuthContext.useEffect`):
```javascript
useEffect(() => {
  const storedUser = localStorage.getItem('bloodDonationUser');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
    setIsAuthenticated(true);
  }
}, []);
```

If user refreshes the page:
1. App reloads
2. AuthContext checks localStorage
3. If user exists → auto-login (restore session)
4. User stays on current protected page

### Logout Process

```
1. User clicks "Logout" button
   ↓
2. logout() function called
   ↓
3. localStorage.removeItem('bloodDonationUser')
   ↓
4. AuthContext updates:
   - isAuthenticated = false
   - user = null
   ↓
5. ProtectedRoute detects !isAuthenticated
   ↓
6. Redirect to /login
```

---

## Route Protection Security

### Client-Side Protection (Current)

⚠️ **Important**: This is a **localhost prototype** with simulated authentication.

**Current Security**:
- Authentication state stored in localStorage
- Protected routes check `isAuthenticated` flag
- Role-based routes check `user.role` value
- All validation happens in the browser

**Limitations**:
- ❌ No real backend validation
- ❌ Anyone can edit localStorage
- ❌ Tokens are not encrypted
- ❌ No server-side role verification

### Production Security (Requirements)

For a **real production system**, you would need:

✅ **Backend API** for authentication  
✅ **JWT tokens** or session-based auth  
✅ **HttpOnly cookies** (not localStorage)  
✅ **Server-side route validation**  
✅ **Password hashing** (bcrypt, argon2)  
✅ **HTTPS** for encrypted communication  
✅ **CSRF protection**  
✅ **Rate limiting** on login endpoints  

**Production Flow**:
```
Login → Backend API validates → Returns JWT
  ↓
JWT stored in HttpOnly cookie
  ↓
Every API request includes JWT
  ↓
Backend verifies JWT on every request
  ↓
Frontend only uses JWT, never validates itself
```

---

## How to Add New Routes

### Adding a Public Route

**Example**: Add an "About Us" page

1. **Create the component**:
```bash
# Create file: src/pages/public/AboutPage.jsx
```

```jsx
const AboutPage = () => {
  return <div><h1>About Us</h1></div>;
};
export default AboutPage;
```

2. **Add route** in `src/routes/AppRoutes.jsx`:
```jsx
import AboutPage from '../pages/public/AboutPage';

// In <Routes>:
<Route path="/about" element={<AboutPage />} />
```

### Adding a Protected Route (Any Role)

**Example**: Add a "Settings" page (all logged-in users)

1. **Create component**: `src/pages/SettingsPage.jsx`

2. **Add route**:
```jsx
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  }
/>
```

### Adding a Role-Based Route

**Example**: Add "Donation Stats" page for donors only

1. **Create component**: `src/pages/dashboard/donor/DonationStats.jsx`

2. **Add route**:
```jsx
<Route
  path="/dashboard/donor/stats"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRole="donor">
        <DonationStats />
      </RoleRoute>
    </ProtectedRoute>
  }
/>
```

---

## Testing Routes

### Test Public Routes
```
✅ Visit / → Should show HomePage
✅ Visit /login → Should show LoginPage
✅ Visit /about → Should show AboutPage
```

### Test Protected Routes (Not Logged In)
```
❌ Visit /dashboard/donor → Redirect to /login
❌ Visit /dashboard/hospital → Redirect to /login
❌ Visit /dashboard/admin → Redirect to /login
```

### Test Protected Routes (Logged In)
```
✅ Login as donor → Visit /dashboard/donor → Success
❌ Login as donor → Visit /dashboard/admin → Redirect to /dashboard/donor
✅ Login as admin → Visit /dashboard/admin → Success
```

### Test Navigation
```
1. Visit / (HomePage)
2. Click "Login" → Navigate to /login
3. Enter credentials and login
4. Automatically redirect to role-based dashboard
5. Try to visit another role's dashboard → Blocked
6. Click "Logout" → Redirect to /
```

---

## Summary

### Key Concepts

1. **BrowserRouter**: Enables client-side routing
2. **Routes & Route**: Define URL-to-Component mapping
3. **ProtectedRoute**: Checks authentication before rendering
4. **RoleRoute**: Checks user role before rendering
5. **AuthContext**: Global authentication state
6. **Navigate**: Programmatic redirects

### Component Hierarchy

```
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route /> <!-- Public -->
      <Route element={<ProtectedRoute>} /> <!-- Auth Required -->
        <Route element={<RoleRoute>} /> <!-- Specific Role -->
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

### Protection Levels

| Level | Check | Redirect |
|-------|-------|----------|
| **None** | - | - |
| **Protected** | `isAuthenticated` | → `/login` |
| **Role-Based** | `user.role === allowedRole` | → User's dashboard |

---

**Next Steps**: Build UI for pages 🎨
