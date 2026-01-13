import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * RoleRoute Component
 * 
 * Purpose: Ensures users can only access pages specific to their role
 * 
 * How it works:
 * 1. Receives allowedRole prop (e.g., 'donor', 'hospital', 'admin')
 * 2. Checks the current user's role from AuthContext
 * 3. If role matches: renders the child component
 * 4. If role doesn't match: redirects to their appropriate dashboard
 * 
 * Example Scenario:
 * - Hospital user tries to access /dashboard/admin
 * - RoleRoute checks: user.role === 'hospital', but route requires 'admin'
 * - Result: Redirect to /dashboard/hospital (their correct dashboard)
 * 
 * Usage:
 * <RoleRoute allowedRole="admin">
 *   <AdminDashboard />
 * </RoleRoute>
 * 
 * @param {string} allowedRole - The role required to access this route
 * @param {ReactNode} children - The component to render if role matches
 */
const RoleRoute = ({ allowedRole, children }) => {
    const { user } = useAuth();

    // Role-based dashboard mapping
    const roleDashboards = {
        donor: '/dashboard/donor',
        hospital: '/dashboard/hospital',
        admin: '/dashboard/admin',
    };

    // If user's role doesn't match the required role
    if (user.role !== allowedRole) {
        // Redirect to their appropriate dashboard
        const userDashboard = roleDashboards[user.role] || '/';
        return <Navigate to={userDashboard} replace />;
    }

    // If role matches, render the requested page
    return children;
};

export default RoleRoute;
