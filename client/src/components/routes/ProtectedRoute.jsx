import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Spinner from '../../shared/components/ui/Spinner.jsx';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../layout/Layout';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { darkMode } = useTheme();
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Spinner size="large" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render child routes in the Layout if authenticated
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute; 