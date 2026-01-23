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
import DonorRequest from '../pages/dashboard/donor/DonorRequest';
import NearbyRequests from '../pages/dashboard/donor/NearbyRequests';
import MyRequests from '../pages/dashboard/donor/MyRequests';
import EligibilityCheck from '../pages/dashboard/donor/EligibilityCheck';
import DonorSettings from '../pages/dashboard/donor/DonorSettings';

// Dashboard Pages - Hospital
import HospitalDashboard from '../pages/dashboard/hospital/HospitalDashboard';
import BloodStock from '../pages/dashboard/hospital/BloodStock';
import RequestBlood from '../pages/dashboard/hospital/RequestBlood';
import RequestHistory from '../pages/dashboard/hospital/RequestHistory';
import IncomingRequests from '../pages/dashboard/hospital/IncomingRequests';
import HospitalAppointments from '../pages/dashboard/hospital/HospitalAppointments';
import BloodStockEntry from '../pages/dashboard/hospital/BloodStockEntry';
import DonorManagement from '../pages/dashboard/hospital/DonorManagement';
import EmergencyDonorCall from '../pages/dashboard/hospital/EmergencyDonorCall';
import HospitalReports from '../pages/dashboard/hospital/HospitalReports';
import BloodDispatch from '../pages/dashboard/hospital/BloodDispatch';
import BatchManagement from '../pages/dashboard/hospital/BatchManagement';
import HospitalProfile from '../pages/dashboard/hospital/HospitalProfile';



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
            <Route
              path="/dashboard/donor/request"
              element={
                <RoleRoute allowedRole="donor">
                  <DonorRequest />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/nearby"
              element={
                <RoleRoute allowedRole="donor">
                  <NearbyRequests />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/my-requests"
              element={
                <RoleRoute allowedRole="donor">
                  <MyRequests />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/eligibility"
              element={
                <RoleRoute allowedRole="donor">
                  <EligibilityCheck />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/donor/settings"
              element={
                <RoleRoute allowedRole="donor">
                  <DonorSettings />
                </RoleRoute>
              }
            />

            {/* Hospital Routes - Only accessible to role: 'hospital' */}
            <Route
              path="/dashboard/hospital/profile"
              element={
                <RoleRoute allowedRole="hospital">
                  <HospitalProfile />
                </RoleRoute>
              }
            />
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


            <Route
              path="/dashboard/hospital/batches"
              element={
                <RoleRoute allowedRole="hospital">
                  <BatchManagement />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/stock-entry"
              element={
                <RoleRoute allowedRole="hospital">
                  <BloodStockEntry />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/donors"
              element={
                <RoleRoute allowedRole="hospital">
                  <DonorManagement />
                </RoleRoute>
              }
            />
            {/* Emergency Call Removed */}
            <Route
              path="/dashboard/hospital/reports"
              element={
                <RoleRoute allowedRole="hospital">
                  <HospitalReports />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/hospital/dispatch"
              element={
                <RoleRoute allowedRole="hospital">
                  <BloodDispatch />
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
