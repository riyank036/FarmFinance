import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const NotFoundPage = () => {
  const { darkMode } = useTheme(); // eslint-disable-line no-unused-vars
  
  return (
    <div className="text-center py-12">
      <FaExclamationTriangle className="mx-auto h-16 w-16 text-primary-500" />
      <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Page not found</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div className="mt-8">
        <Link to="/" className="btn btn-primary">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 