import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTractor, FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Alert from '../components/ui/Alert';
import Spinner from '../shared/components/ui/Spinner.jsx';
import { useTheme } from '../context/ThemeContext';

// Zod validation schema
const registerSchema = z.object({
  username: z.string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(30, { message: 'Username cannot exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: 'Username can only contain letters, numbers, and underscores' 
    }),
  
  email: z.string()
    .email({ message: 'Invalid email address' }),
  
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }),
    
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, error, clearErrors } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    try {
      registerSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setValidationErrors(formattedErrors);
      return false;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation with Zod
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    clearErrors();
    
    // Remove confirmPassword from data sent to API
    const { confirmPassword: _, ...registerData } = formData;
    
    const success = await register(registerData);
    
    if (success) {
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md w-full space-y-8 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} p-8 rounded-lg shadow-md`}>
        <div className="text-center">
          <div className="flex justify-center">
            <FaTractor className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className={`mt-4 text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            FarmFinance
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('auth.createAccount')}
          </p>
        </div>
        
        {error && <Alert type="error" message={error} onClose={clearErrors} />}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">{t('auth.username')}</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={`form-input ${validationErrors.username ? 'border-red-500' : ''}`}
              placeholder={t('auth.usernamePlaceholder')}
              value={formData.username}
              onChange={handleChange}
            />
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">{t('personal.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`form-input ${validationErrors.email ? 'border-red-500' : ''}`}
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">{t('auth.password')}</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`form-input pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('auth.passwordRequirements')}
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`form-input pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full btn btn-primary py-3 flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="small" color="white" />
              ) : (
                <>
                  <FaUserPlus className="mr-2" />
                  {t('auth.register')}
                </>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 