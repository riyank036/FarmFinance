import { createContext, useState, useEffect } from 'react';
import axios from '../../../core/api/axiosConfig';
import { AUTH_ENDPOINTS } from '../../../core/config/apiConfig.js';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                // Verify token is valid by getting user data
                try {
                    const res = await axios.get(AUTH_ENDPOINTS.ME);

                    if (res.data.success) {
                        setUser(res.data.user);
                        setIsAuthenticated(true);
                        const userIsAdmin = res.data.user.role === 'admin';
                        setIsAdmin(userIsAdmin);
                    } else {
                        // If token is invalid, clear everything
                        localStorage.removeItem('token');
                        setUser(null);
                        setIsAuthenticated(false);
                        setIsAdmin(false);
                    }
                } catch (error) {
                    // If token is invalid, clear everything
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    // Register user
    const register = async (formData) => {
        setError(null);
        try {
            const res = await axios.post(AUTH_ENDPOINTS.REGISTER, formData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                const userIsAdmin = res.data.user.role === 'admin';
                setIsAdmin(userIsAdmin);
                return true;
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            );
            return false;
        }
    };

    // Login user
    const login = async (formData) => {
        setError(null);
        try {
            const res = await axios.post(AUTH_ENDPOINTS.LOGIN, formData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                const hasAdminRole = res.data.user && res.data.user.role === 'admin';
                setIsAdmin(hasAdminRole);
                return true;
            }
        } catch (error) {
            // Pass through the exact error message from the server when available
            setError(
                error.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
            return false;
        }
    };

    // Logout user
    const logout = async () => {
        try {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        } catch (error) {
            // Silent error handling
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        setError(null);
        setResetEmailSent(false);
        try {
            const res = await axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });

            if (res.data.success) {
                setResetEmailSent(true);
                return true;
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setError('Failed to send password reset email. Please try again.');
            return false;
        }
    };

    // Clear errors
    const clearErrors = () => {
        setError(null);
    };

    // Clear reset email status
    const clearResetStatus = () => {
        setResetEmailSent(false);
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        setError(null);
        try {
            const res = await axios.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData);

            if (res.data.success) {
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isAdmin,
                isLoading,
                error,
                resetEmailSent,
                register,
                login,
                logout,
                forgotPassword,
                clearErrors,
                clearResetStatus,
                updateProfile,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;