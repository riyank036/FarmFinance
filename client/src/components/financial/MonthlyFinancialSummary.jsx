import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

const MonthlyFinancialSummary = ({ data }) => {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  
  const profitPercentage = data.totalIncome > 0 
    ? Math.round((data.netProfit / data.totalIncome) * 100) 
    : 0;
  
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
      <h2 className="text-lg font-semibold mb-4">
        {t('financial.summary')} - {data.monthName} {data.year}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Income Card */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('financial.totalIncome')}
          </div>
          <div className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {formatCurrency(data.totalIncome)}
          </div>
        </div>
        
        {/* Expenses Card */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('financial.totalExpenses')}
          </div>
          <div className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {formatCurrency(data.totalExpenses)}
          </div>
        </div>
        
        {/* Profit/Loss Card */}
        <div className={`p-4 rounded-lg ${
          data.netProfit >= 0
            ? darkMode ? 'bg-emerald-900' : 'bg-emerald-50'
            : darkMode ? 'bg-red-900' : 'bg-red-50'
        }`}>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {data.netProfit >= 0 ? t('financial.netProfit') : t('financial.netLoss')}
          </div>
          <div className={`text-xl font-bold ${
            data.netProfit >= 0
              ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
              : darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {formatCurrency(Math.abs(data.netProfit))}
          </div>
          {data.totalIncome > 0 && data.netProfit >= 0 && (
            <div className="text-sm mt-1">
              {t('financial.profitMargin')}: {profitPercentage}%
            </div>
          )}
        </div>
      </div>
      
      {/* Financial insights based on the data */}
      <div className={`mt-4 p-3 rounded-lg ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h3 className="font-medium text-sm mb-2">{t('financial.insights')}</h3>
        {data.netProfit >= 0 ? (
          <p className="text-sm text-center">
            {t('financial.profitableMsg', { percent: profitPercentage })}
          </p>
        ) : (
          <p className="text-sm text-center">
            {t('financial.lossMsg')}
          </p>
        )}
      </div>
    </div>
  );
};

export default MonthlyFinancialSummary; 