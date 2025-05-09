import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaMoneyBillWave, FaChartLine, FaExchangeAlt, FaCalendarAlt } from 'react-icons/fa';
import { DASHBOARD_ENDPOINTS } from '../../core/config/apiConfig';

const FinancialSummary = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    lastMonth: {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0
    },
    recentActivity: []
  });

  // Currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(DASHBOARD_ENDPOINTS.FINANCIAL_SUMMARY);
        
        if (response.data.success) {
          setFinancialData(response.data.data);
        } else {
          setError('Failed to fetch financial data');
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setError('Error fetching financial data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {t('profile.financialSummary')}
          </h3>
        </div>
        <div className="px-4 py-12 sm:p-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            {t('profile.financialSummary')}
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {t('profile.financialSummary')}
        </h3>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Total Income */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-800 rounded-full p-3">
                <FaMoneyBillWave className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('financial.totalIncome')}
                </h2>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(financialData.totalIncome)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-800 rounded-full p-3">
                <FaExchangeAlt className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('financial.totalExpenses')}
                </h2>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(financialData.totalExpense)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Net Profit/Loss */}
          <div className={`bg-gradient-to-br ${
            financialData.netAmount >= 0 
              ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800' 
              : 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800'
          } p-4 rounded-lg border`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                financialData.netAmount >= 0 
                  ? 'bg-blue-100 dark:bg-blue-800' 
                  : 'bg-yellow-100 dark:bg-yellow-800'
              } rounded-full p-3`}>
                <FaChartLine className={`h-5 w-5 ${
                  financialData.netAmount >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {t('financial.netProfitLoss')}
                </h2>
                <p className={`text-xl font-semibold ${
                  financialData.netAmount >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {formatCurrency(financialData.netAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Last Month's Performance */}
        <div className="mt-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center mb-4">
            <FaCalendarAlt className="mr-2" /> {t('financial.lastMonth')}
          </h4>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('financial.income')}</span>
                <span className="text-lg font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(financialData.lastMonth.totalIncome)}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('financial.expenses')}</span>
                <span className="text-lg font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(financialData.lastMonth.totalExpense)}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {financialData.lastMonth.netAmount >= 0 ? t('financial.profit') : t('financial.loss')}
                </span>
                <span className={`text-lg font-medium ${
                  financialData.lastMonth.netAmount >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {formatCurrency(Math.abs(financialData.lastMonth.netAmount))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary; 