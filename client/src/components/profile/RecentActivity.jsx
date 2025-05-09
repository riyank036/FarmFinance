import { useTranslation } from 'react-i18next';
import { FaArrowUp, FaArrowDown, FaRegClock } from 'react-icons/fa';

const RecentActivity = ({ activities = [] }) => {
  const { t } = useTranslation();
  
  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Date formatter
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
          <FaRegClock className="mr-2" /> {t('profile.recentActivity')}
        </h3>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {activities && activities.length > 0 ? (
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
              {activities.map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'income' ? (
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <FaArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <FaArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.description || activity.category}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {formatDate(activity.date)} • {t(`activity.${activity.type}`)}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {formatCurrency(activity.amount)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {t('activity.noActivity')}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 