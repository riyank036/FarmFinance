import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartLine, FaReceipt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SummaryCard from '../components/dashboard/SummaryCard';
import FinanceChart from '../components/dashboard/FinanceChart';
import Alert from '../components/ui/Alert';
import Spinner from '../shared/components/ui/Spinner.jsx';
import { dashboardAPI } from '../core/api/api.js';

const HomePage = () => {
  const { t } = useTranslation();
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch summary and monthly data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch summary data (total income, expenses, profit)
        const summaryResponse = await dashboardAPI.getSummary();
        setSummaryData(summaryResponse.data);
        
        // Fetch monthly data for charts
        const monthlyResponse = await dashboardAPI.getMonthlyStats();
        setMonthlyData(monthlyResponse.data);
      } catch (error) {
        setError(t('dashboard.fetchError'));
        console.error('Dashboard data fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [t]);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl text-center">{t('dashboard.title')}</h1>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="large" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
              title={t('financial.totalIncome')} 
              amount={summaryData?.totalIncome || 0} 
              icon={<FaMoneyBillWave className="h-6 w-6" />} 
              change={12.5} // Example percentage change
            />
            <SummaryCard 
              title={t('financial.totalExpenses')} 
              amount={summaryData?.totalExpense || 0} 
              icon={<FaReceipt className="h-6 w-6" />} 
              change={-4.2} // Example percentage change
            />
            <SummaryCard 
              title={t('financial.netProfitLoss')} 
              amount={summaryData?.profit || 0} 
              icon={<FaChartLine className="h-6 w-6" />} 
              change={8.7} // Example percentage change
              isProfit={summaryData?.profit > 0}
            />
          </div>
          
          {/* Chart */}
          <FinanceChart data={monthlyData} />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 heading-text">{t('dashboard.financialInsights')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {summaryData?.profit > 0 
                      ? t('dashboard.profitableMsg', { percent: ((summaryData.profit / summaryData.totalIncome) * 100).toFixed(1) })
                      : t('dashboard.lossMsg')}
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.highestProfitMonth', { month: monthlyData?.sort((a, b) => b.profit - a.profit)[0]?.month || t('common.notAvailable') })}
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.peakIncome')}
                  </p>
                </li>
              </ul>
            </div>
            
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 heading-text">{t('dashboard.recommendations')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.diversifyRecommendation')}
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.expenseReview')}
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('dashboard.emergencyFund')}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage; 