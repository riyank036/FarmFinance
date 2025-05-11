import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTractor, FaBars, FaTimes, FaUserCircle, FaChartLine } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Navigation links with translation keys
  const navLinks = [
    { name: t('nav.dashboard'), path: '/' },
    { name: t('nav.addExpense'), path: '/add-expense' },
    { name: t('nav.addIncome'), path: '/add-income' },
    { name: t('nav.expenses'), path: '/expenses' },
    { name: t('nav.income'), path: '/income' },
    { name: t('nav.monthlyFinancial'), path: '/monthly-financial', icon: <FaChartLine className="mr-1" /> },
  ];

  return (
    <nav className="bg-primary-700 shadow-md dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <FaTractor className="h-8 w-8 text-white dark:text-[#4ADE80]" />
              <span className="ml-2 text-white font-semibold text-lg">FarmFinance</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center">
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === link.path
                        ? 'bg-primary-800 text-white dark:bg-gray-900'
                        : 'text-primary-100 hover:bg-primary-600 dark:hover:bg-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    location.pathname === '/profile'
                      ? 'bg-primary-800 text-white dark:bg-gray-900'
                      : 'text-primary-100 hover:bg-primary-600 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaUserCircle className="mr-1" /> {t('nav.profile')}
                </Link>
              </div>
            )}
            
            {/* Theme toggle button */}
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-600 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-700 dark:bg-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === link.path
                        ? 'bg-primary-800 text-white dark:bg-gray-900'
                        : 'text-primary-100 hover:bg-primary-600 dark:hover:bg-gray-700'
                    }`}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    location.pathname === '/profile'
                      ? 'bg-primary-800 text-white dark:bg-gray-900'
                      : 'text-primary-100 hover:bg-primary-600 dark:hover:bg-gray-700'
                  }`}
                  onClick={closeMenu}
                >
                  <FaUserCircle className="mr-2" /> {t('nav.profile')}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-600 dark:hover:bg-gray-700"
                  onClick={closeMenu}
                >
                  {t('auth.login')}
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-primary-600 dark:hover:bg-gray-700"
                  onClick={closeMenu}
                >
                  {t('auth.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 