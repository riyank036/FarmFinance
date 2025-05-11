import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../../shared/components/ui/Spinner';

const AdminRoute = () => {
  const { user, isLoading, isAdmin } = useAuth();

  // Debug the admin route protection
  console.log('AdminRoute - Protection Check:', { 
    isLoading, 
    isAuthenticated: !!user, 
    userRole: user?.role,
    isAdmin, 
    redirectingTo: !user ? '/admin/login' : !isAdmin ? '/admin/login' : null 
  });

  // Show loading indicator while checking authentication
  if (isLoading) {
    return <Spinner size="large" />;
  }

  // Check if user is authenticated and has admin role
  if (!user) {
    console.log('AdminRoute - User not authenticated, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has admin role
  if (!isAdmin) {
    console.log('AdminRoute - User authenticated but not admin, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  // If user is authenticated and has admin role, render the protected content
  console.log('AdminRoute - User is admin, allowing access');
  return <Outlet />;
};

export default AdminRoute; 