import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const Alert = ({ type = 'info', message, onClose }) => {
  const { darkMode } = useTheme();
  
  if (!message) return null;

  // Define alert styles based on type
  const alertStyles = {
    success: {
      bgColor: darkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-100',
      textColor: darkMode ? 'text-green-300' : 'text-green-800',
      borderColor: darkMode ? 'border-green-800' : 'border-green-200',
      icon: <FaCheckCircle className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
    },
    error: {
      bgColor: darkMode ? 'bg-red-900 bg-opacity-30' : 'bg-red-100',
      textColor: darkMode ? 'text-red-300' : 'text-red-800',
      borderColor: darkMode ? 'border-red-800' : 'border-red-200',
      icon: <FaTimesCircle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
    },
    warning: {
      bgColor: darkMode ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100',
      textColor: darkMode ? 'text-yellow-300' : 'text-yellow-800',
      borderColor: darkMode ? 'border-yellow-800' : 'border-yellow-200',
      icon: <FaExclamationTriangle className={`h-5 w-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
    },
    info: {
      bgColor: darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100',
      textColor: darkMode ? 'text-blue-300' : 'text-blue-800',
      borderColor: darkMode ? 'border-blue-800' : 'border-blue-200',
      icon: <FaInfoCircle className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
    }
  };

  const { bgColor, textColor, borderColor, icon } = alertStyles[type] || alertStyles.info;

  return (
    <div className={`relative ${bgColor} ${textColor} ${borderColor} border p-4 rounded-md mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            className={`ml-auto -mx-1.5 -my-1.5 ${textColor} hover:${bgColor} rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400`}
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <FaTimesCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert; 