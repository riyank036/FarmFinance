import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

const SummaryCard = ({ title, amount, icon, change, isProfit }) => {
  const { darkMode } = useTheme();
  const isPositive = change > 0;
  
  // Determine background color based on card type
  const getBackgroundColor = () => {
    if (darkMode) {
      if (title.toLowerCase().includes('income')) return 'dark:bg-green-900 dark:bg-opacity-20';
      if (title.toLowerCase().includes('expense')) return 'dark:bg-red-900 dark:bg-opacity-20';
      if (title.toLowerCase().includes('profit')) {
        return isProfit ? 'dark:bg-blue-900 dark:bg-opacity-20' : 'dark:bg-orange-900 dark:bg-opacity-20';
      }
      return 'dark:bg-gray-800';
    } else {
      if (title.toLowerCase().includes('income')) return 'bg-green-50';
      if (title.toLowerCase().includes('expense')) return 'bg-red-50';
      if (title.toLowerCase().includes('profit')) {
        return isProfit ? 'bg-blue-50' : 'bg-orange-50';
      }
      return 'bg-gray-50';
    }
  };

  // Determine icon color based on card type
  const getIconColor = () => {
    if (title.toLowerCase().includes('income')) return 'text-green-500 dark:text-green-400';
    if (title.toLowerCase().includes('expense')) return 'text-red-500 dark:text-red-400';
    if (title.toLowerCase().includes('profit')) {
      return isProfit ? 'text-blue-500 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  // Get directional arrow icon for the change percentage
  const ChangeIcon = isPositive ? FaArrowUp : FaArrowDown;
  
  // Get text color for the change percentage
  const changeColorClass = isPositive 
    ? title.toLowerCase().includes('expense') 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-green-600 dark:text-green-400'
    : title.toLowerCase().includes('expense') 
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className={`card ${getBackgroundColor()} border dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">{title}</h3>
          <div className="mt-1 text-2xl font-semibold dark:text-white">
            {formatCurrency(amount)}
          </div>
          
          {typeof change !== 'undefined' && (
            <div className="mt-2 flex items-center">
              <ChangeIcon className={`h-3 w-3 mr-1 ${changeColorClass}`} />
              <span className={`text-sm ${changeColorClass}`}>
                {Math.abs(change)}% from last month
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-full ${getIconColor()} bg-opacity-20 dark:bg-opacity-30`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard; 