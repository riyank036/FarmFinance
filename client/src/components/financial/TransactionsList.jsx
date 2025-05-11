import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

const TransactionsList = ({ transactions }) => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  
  if (!transactions || transactions.length === 0) {
    return <p className="text-sm">{t('financial.noTransactions')}</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t('financial.date')}
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t('financial.category')}
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t('financial.amount')}
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              {t('financial.type')}
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {transactions.map((transaction, index) => (
            <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {formatDate(transaction.date)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {transaction.category}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <span className={transaction.type === 'Income' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'}>
                  {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  transaction.type === 'Income'
                    ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type === 'Income' ? t('activity.income') : t('activity.expense')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsList; 