import { createContext, useState, useEffect } from 'react';
import axios from '../../../core/api/axiosConfig';
import { AUTH_ENDPOINTS } from '../../../core/config/apiConfig.js';

// Create the auth context
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    // State variables
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    // Check if user is logged in when component mounts
    useEffect(() => {
        async function checkUserLoggedIn() {
            setIsLoading(true);
            
            // Get token from localStorage
                const token = localStorage.getItem('token');
            
            // If no token, user is not logged in
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                try {
                // Get user data
                    const res = await axios.get(AUTH_ENDPOINTS.ME);

                    if (res.data.success) {
                    // Set user data
                        setUser(res.data.user);
                        setIsAuthenticated(true);
                    
                    // Check if user is admin
                    if (res.data.user.role === 'admin') {
                        setIsAdmin(true);
                    }
                    } else {
                    // Clear everything if token is invalid
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                // Clear everything if there's an error
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
            }
            
            setIsLoading(false);
        }

        checkUserLoggedIn();
    }, []);

    // Register new user
    const register = async (formData) => {
        setError(null);
        
        try {
            // Send register request
            const res = await axios.post(AUTH_ENDPOINTS.REGISTER, formData);

            // If successful, save token and user data
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                
                // Check if user is admin
                if (res.data.user.role === 'admin') {
                    setIsAdmin(true);
                }
                
                return true;
            }
        } catch (error) {
            // Handle error
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
            
            return false;
        }
    };

    // Login user
    const login = async (formData) => {
        setError(null);
        
        try {
            // Send login request
            const res = await axios.post(AUTH_ENDPOINTS.LOGIN, formData);

            // If successful, save token and user data
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                
                // Check if user is admin
                if (res.data.user.role === 'admin') {
                    setIsAdmin(true);
                }
                
                return true;
            }
        } catch (error) {
            // Handle error
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Login failed. Please check your credentials.');
            }
            
            return false;
        }
    };

    // Logout user
    const logout = () => {
        // Remove token from localStorage
            localStorage.removeItem('token');
        
        // Clear user data
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
    };

    // Forgot password
    const forgotPassword = async (email) => {
        setError(null);
        setResetEmailSent(false);
        
        try {
            // Send forgot password request
            const res = await axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });

            // If successful, set resetEmailSent to true
            if (res.data.success) {
                setResetEmailSent(true);
                return true;
            }
        } catch (error) {
            // Handle error
            console.log('Password reset error:', error);
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
            // Send update profile request
            const res = await axios.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData);

            // If successful, update user data
            if (res.data.success) {
                setUser(res.data.user);
                return { success: true, user: res.data.user };
            }
        } catch (error) {
            // Handle error
            let errorMessage = 'Failed to update profile. Please try again.';
            
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
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