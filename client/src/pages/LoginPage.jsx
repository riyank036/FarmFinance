import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTractor, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import Alert from '../components/ui/Alert';
import Spinner from '../shared/components/ui/Spinner.jsx';
import { useTheme } from '../context/ThemeContext';

// Zod validation schema
const loginSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email address' }),
  
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
});

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, error, clearErrors } = useAuth();
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

  const validateLoginForm = () => {
    try {
      loginSchema.parse(formData);
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
    if (!validateLoginForm()) {
      return;
    }
    
    setIsSubmitting(true);
    clearErrors();
    
    const success = await login(formData);
    
    if (success) {
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            {t('auth.signInMessage')}
          </p>
        </div>
        
        {error && <Alert type="error" message={error} onClose={clearErrors} />}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
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
          </div>
          
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              {t('auth.rememberMe')}
            </label>
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
                <><FaSignInAlt className="mr-2" /> {t('auth.login')}</>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                {t('auth.signUp')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 