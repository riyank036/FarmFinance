import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

// This is the summary card component for the dashboard
const SummaryCard = ({ title, amount, icon, change, isProfit }) => {
  // Get theme from context
  const { darkMode } = useTheme();
  
  // Check if change is positive
  const isPositive = change > 0;
  
  // Set background color based on card type
  let bgColor = "";
  const cardType = title.toLowerCase();
  
  // For dark mode
  if (darkMode) {
    if (cardType.includes('income')) {
      bgColor = 'dark:bg-green-900 dark:bg-opacity-20';
    } 
    else if (cardType.includes('expense')) {
      bgColor = 'dark:bg-red-900 dark:bg-opacity-20';
    } 
    else if (cardType.includes('profit')) {
      bgColor = isProfit ? 'dark:bg-blue-900 dark:bg-opacity-20' : 'dark:bg-orange-900 dark:bg-opacity-20';
    } 
    else {
      bgColor = 'dark:bg-gray-800';
    }
  } 
  // For light mode
  else {
    if (cardType.includes('income')) {
      bgColor = 'bg-green-50';
    } 
    else if (cardType.includes('expense')) {
      bgColor = 'bg-red-50';
    } 
    else if (cardType.includes('profit')) {
      bgColor = isProfit ? 'bg-blue-50' : 'bg-orange-50';
    } 
    else {
      bgColor = 'bg-gray-50';
    }
  }

  // Set icon color based on type
  let iconColor = "";
  if (cardType.includes('income')) {
    iconColor = 'text-green-500 dark:text-green-400';
  } 
  else if (cardType.includes('expense')) {
    iconColor = 'text-red-500 dark:text-red-400';
  } 
  else if (cardType.includes('profit')) {
    iconColor = isProfit 
      ? 'text-blue-500 dark:text-blue-400' 
      : 'text-orange-500 dark:text-orange-400';
  } 
  else {
    iconColor = 'text-gray-500 dark:text-gray-400';
  }

  // Set change color based on if it's positive or negative
  let changeColor = "";
  if (isPositive) {
    changeColor = cardType.includes('expense')
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400';
  } 
  else {
    changeColor = cardType.includes('expense')
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  }

  // Render the component
  return (
    <div className={`card ${bgColor} border dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">{title}</h3>
          <div className="mt-1 text-2xl font-semibold dark:text-white">
            {formatCurrency(amount)}
          </div>
          
          {/* Show change if available */}
          {typeof change !== 'undefined' && (
            <div className="mt-2 flex items-center">
              {/* Show up or down arrow based on change */}
              {isPositive ? (
                <FaArrowUp className={`h-3 w-3 mr-1 ${changeColor}`} />
              ) : (
                <FaArrowDown className={`h-3 w-3 mr-1 ${changeColor}`} />
              )}
              
              {/* Show change percentage */}
              <span className={`text-sm ${changeColor}`}>
                {Math.abs(change)}% from last month
              </span>
            </div>
          )}
        </div>
        
        {/* Show icon if available */}
        {icon && (
          <div className={`p-3 rounded-full ${iconColor} bg-opacity-20 dark:bg-opacity-30`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component
export default SummaryCard; 