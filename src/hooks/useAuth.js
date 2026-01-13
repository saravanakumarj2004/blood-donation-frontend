import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth Hook
 * 
 * Purpose: Convenient way to access authentication state and methods
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * Returns:
 * - user: Current user object (null if not logged in)
 * - isAuthenticated: Boolean indicating login status
 * - login: Function to authenticate user
 * - logout: Function to clear session
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
