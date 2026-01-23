import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

/**
 * AuthContext - Centralized Authentication State Management
 * 
 * Purpose: Provides authentication state and methods across the entire app
 * 
 * State Provided:
 * - isAuthenticated: boolean (is user logged in?)
 * - user: object (user details: id, name, email, role)
 * - login: function (authenticate user)
 * - logout: function (clear user session)
 * 
 * Note: This is a SIMULATED authentication system for localhost/prototype
 * In production, you'd connect to a real backend API
 */

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Lazy initialization to avoid race conditions with localStorage
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('bloodDonationUser');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                // Ensure userData is a valid object
                if (userData && typeof userData === 'object' && userData.role) {
                    return userData;
                }
            }
            return null;
        } catch (error) {
            console.error("Failed to restore user session:", error);
            localStorage.removeItem('bloodDonationUser');
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => !!user); // Initialize based on user

    // Sync isAuthenticated with user whenever user changes
    useEffect(() => {
        setIsAuthenticated(!!user);
    }, [user]);

    /**
     * Login Function
     * 
     * @param {Object} credentials - { email, password, role }
     * 
     * How it works (SIMULATED):
     * 1. Validate credentials (for now, just check if fields exist)
     * 2. Create user object with role
     * 3. Store in localStorage
     * 4. Update AuthContext state
     * 5. Return success/error
     * 
     * In production: This would make an API call to backend
     */
    const login = async (credentials) => {
        try {
            const result = await authAPI.login(credentials);
            if (result.success || result.token) {
                // Backend returns user data flattened, not nested in 'user'
                const userData = { ...result };
                localStorage.setItem('bloodDonationUser', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true, user: userData };
            }
            return { success: false, message: result.message };
        } catch (error) {
            console.error("Login Error:", error);
            // Check for error.error (Backend) or error.message (Network/JS)
            const msg = error.error || error.message || 'Login failed';
            return { success: false, message: msg };
        }
    };

    /**
     * Logout Function
     * 
     * How it works:
     * 1. Clear user from localStorage
     * 2. Reset AuthContext state
     * 3. User will be redirected to login (via ProtectedRoute)
     */
    const logout = () => {
        // Remove user from localStorage
        localStorage.removeItem('bloodDonationUser');

        // Reset state
        setUser(null);
        setIsAuthenticated(false);
    };

    // Context value provided to all children
    const value = {
        user,
        isAuthenticated,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
