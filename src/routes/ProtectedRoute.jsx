import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute Component
 * 
 * Purpose: Prevents unauthenticated users from accessing protected pages
 * 
 * How it works:
 * 1. Checks if user is authenticated (via AuthContext)
 * 2. If authenticated: renders the child component (e.g., Dashboard)
 * 3. If not authenticated: redirects to /login page
 * 
 * Usage:
 * <ProtectedRoute>
 *   <DonorDashboard />
 * </ProtectedRoute>
 * 
 * @param {ReactNode} children - The component to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // If user is not logged in, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user is authenticated, render the requested page
    return children;
};

export default ProtectedRoute;
