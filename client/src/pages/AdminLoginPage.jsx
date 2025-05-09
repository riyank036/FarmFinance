import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaUser, FaTractor, FaEye, FaEyeSlash } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated, isAdmin, error, user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  // If already authenticated and is admin, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
    } else if (isAuthenticated && !isAdmin) {
      setLoginError('You do not have admin privileges. Access denied.');
    }
  }, [isAuthenticated, isAdmin, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      const success = await login(formData);
      
      if (success) {
        // Additional check after login to verify admin role
        if (!isAdmin) {
          setLoginError('You do not have admin privileges. Access denied.');
          setIsLoading(false);
          return;
        }
        
        navigate('/admin');
      } else {
        setLoginError(error || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setLoginError('An error occurred during login. Please try again.');
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-lg p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 p-3 rounded-full">
            <FaTractor className="text-white h-8 w-8" />
          </div>
        </div>
        
        <h1 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Login</h1>
        
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className={`block font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                }`}
                placeholder="admin@example.com"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className={`block font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-700 placeholder-gray-500'
                }`}
                placeholder="••••••••"
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} h-4 w-4`} />
                ) : (
                  <FaEye className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} h-4 w-4`} />
                )}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className={`text-sm ${darkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-800'}`}>
            Return to Regular Login
          </Link>
        </div>
      </div>
      
      <div className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Administrator access only. Unauthorized access is prohibited.</p>
      </div>
    </div>
  );
};

export default AdminLoginPage; 