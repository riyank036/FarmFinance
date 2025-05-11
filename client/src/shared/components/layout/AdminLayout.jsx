import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTractor, 
  FaSignOutAlt, 
  FaUsers, 
  FaChartBar, 
  FaMoneyBillWave,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUserCog,
  FaBars,
  FaTimes,
  FaCommentAlt
} from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import ThemeToggle from '../../../components/ui/ThemeToggle';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  // Admin navigation links
  const adminNavLinks = [
    { name: 'User Management', path: '/admin/users', icon: <FaUsers className="h-5 w-5" /> },
    { name: 'Transaction Management', path: '/admin/transactions', icon: <FaExchangeAlt className="h-5 w-5" /> },
    { name: 'Monthly Financial Data', path: '/admin/monthly', icon: <FaCalendarAlt className="h-5 w-5" /> },
    { name: 'Feedback Management', path: '/admin/feedback', icon: <FaCommentAlt className="h-5 w-5" /> },
    { name: 'Profile & Settings', path: '/admin/profile', icon: <FaUserCog className="h-5 w-5" /> },
    { name: 'Back to App', path: '/', icon: <FaTractor className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-primary-800 dark:bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <FaTractor className="h-8 w-8 text-white dark:text-[#4ADE80]" />
            {isSidebarOpen && (
              <span className="ml-3 font-bold text-lg">Admin Panel</span>
            )}
          </div>
          <button
            className="p-1 rounded-md hover:bg-primary-700 dark:hover:bg-gray-700"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="mt-6 px-2">
            {adminNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center py-3 px-4 rounded-md transition-colors duration-200 mb-2 ${
                  location.pathname === link.path
                    ? 'bg-primary-700 dark:bg-gray-700'
                    : 'hover:bg-primary-700 dark:hover:bg-gray-700'
                }`}
              >
                <div className="text-primary-200 dark:text-gray-300">{link.icon}</div>
                {isSidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{link.name}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-primary-700 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-primary-700 dark:hover:bg-gray-700 text-white flex items-center"
            >
              <FaSignOutAlt className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-2">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              {adminNavLinks.find(link => link.path === location.pathname)?.name || 'Admin Panel'}
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 p-4 shadow-inner">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Farm Finance - Admin Control Panel
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout; 