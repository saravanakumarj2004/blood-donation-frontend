import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Dashboard Pages - Donor
import DonorDashboard from '../pages/dashboard/donor/DonorDashboard';
import DonorProfile from '../pages/dashboard/donor/DonorProfile';
import DonationHistory from '../pages/dashboard/donor/DonationHistory';
import AppointmentBooking from '../pages/dashboard/donor/AppointmentBooking';

// Dashboard Pages - Hospital
import HospitalDashboard from '../pages/dashboard/hospital/HospitalDashboard';
import BloodStock from '../pages/dashboard/hospital/BloodStock';
import RequestBlood from '../pages/dashboard/hospital/RequestBlood';
import RequestHistory from '../pages/dashboard/hospital/RequestHistory';
import IncomingRequests from '../pages/dashboard/hospital/IncomingRequests';
import HospitalAppointments from '../pages/dashboard/hospital/HospitalAppointments';

// Dashboard Pages - Admin
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import ManageDonors from '../pages/dashboard/admin/ManageDonors';
import ManageHospitals from '../pages/dashboard/admin/ManageHospitals';
import BloodInventory from '../pages/dashboard/admin/BloodInventory';
import Reports from '../pages/dashboard/admin/Reports';

// Route Protection Components
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

/**
 * AppRoutes - Main Routing Configuration
 * 
 * Route Structure:
 * - Public Routes: / and /login (accessible to everyone)
 * - Protected Routes: All /dashboard/* routes (require authentication)
 * - Role Routes: Specific dashboard routes based on user role
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ========== PROTECTED DASHBOARD ROUTES ========== */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

            {/* Donor Routes - Only accessible to role: 'donor' */}
            <Route
              path="/dashboard/donor"
              element={
                <RoleRoute allowedRole="donor">
                  <DonorDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/profile"
              element={
                <RoleRoute allowedRole="donor">
                  <DonorProfile />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/history"
              element={
                <RoleRoute allowedRole="donor">
                  <DonationHistory />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/appointments"
              element={
                <RoleRoute allowedRole="donor">
                  <AppointmentBooking />
                </RoleRoute>
              }
            />

            {/* Hospital Routes - Only accessible to role: 'hospital' */}
            <Route
              path="/dashboard/hospital"
              element={
                <RoleRoute allowedRole="hospital">
                  <HospitalDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/stock"
              element={
                <RoleRoute allowedRole="hospital">
                  <BloodStock />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/request"
              element={
                <RoleRoute allowedRole="hospital">
                  <RequestBlood />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/history"
              element={
                <RoleRoute allowedRole="hospital">
                  <RequestHistory />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/incoming-requests"
              element={
                <RoleRoute allowedRole="hospital">
                  <IncomingRequests />
                </RoleRoute>
              }
            />

            <Route
              path="/dashboard/hospital/appointments"
              element={
                <RoleRoute allowedRole="hospital">
                  <HospitalAppointments />
                </RoleRoute>
              }
            />

            {/* Admin Routes - Only accessible to role: 'admin' */}
            <Route
              path="/dashboard/admin"
              element={
                <RoleRoute allowedRole="admin">
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/admin/donors"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageDonors />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/admin/hospitals"
              element={
                <RoleRoute allowedRole="admin">
                  <ManageHospitals />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/admin/inventory"
              element={
                <RoleRoute allowedRole="admin">
                  <BloodInventory />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/admin/reports"
              element={
                <RoleRoute allowedRole="admin">
                  <Reports />
                </RoleRoute>
              }
            />
          </Route>

          {/* ========== FALLBACK ROUTES ========== */}

          {/* Redirect /dashboard to appropriate role-based dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/donor" replace />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found - Catch all unmatched routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
