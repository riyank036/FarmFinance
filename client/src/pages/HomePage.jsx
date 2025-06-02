import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartLine, FaReceipt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SummaryCard from '../components/dashboard/SummaryCard';
import FinanceChart from '../components/dashboard/FinanceChart';
import Alert from '../components/ui/Alert';
import Spinner from '../shared/components/ui/Spinner.jsx';
import { dashboardAPI } from '../core/api/api.js';

// HomePage component for the dashboard
function HomePage() {
  // Initialize state variables
  const { t } = useTranslation();
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch data when component loads
  useEffect(() => {
    // Function to get dashboard data
    async function getDashboardData() {
      // Set loading to true
      setIsLoading(true);
      // Clear any errors
      setError('');
      
      try {
        // Get summary data
        const summaryResponse = await dashboardAPI.getSummary();
        console.log('Got summary data:', summaryResponse);
        
        // Check if we have data
        if (summaryResponse && summaryResponse.data) {
          // Update state with summary data
          setSummaryData(summaryResponse.data);
        } else {
          console.log('No summary data found');
        }
        
        // Get monthly data for chart
        const monthlyResponse = await dashboardAPI.getMonthlyStats();
        console.log('Got monthly data:', monthlyResponse);
        
        // Check if we have data
        if (monthlyResponse && monthlyResponse.data) {
          // Update state with monthly data
          setMonthlyData(monthlyResponse.data);
        } else {
          console.log('No monthly data found');
        }
      } catch (error) {
        // Show error message
        setError(t('dashboard.fetchError'));
        // Log error to console
        console.log('Error fetching dashboard data:', error);
        console.log('Error details:', error.message);
      }
      
      // Set loading to false
      setIsLoading(false);
    }
    
    // Call the function
    getDashboardData();
  }, [t]);
  
  // Function to close error alert
  function handleCloseError() {
    setError('');
    console.log('Error cleared');
  }
  
  // Calculate values for display
  let totalIncome = 0;
  let totalExpense = 0;
  let profit = 0;
  
  // Check if we have summary data
  if (summaryData !== null && summaryData !== undefined) {
    // Get values from summary data
    totalIncome = summaryData.totalIncome || 0;
    totalExpense = summaryData.totalExpense || 0;
    
    // Use provided profit or calculate it
    profit = summaryData.profit !== undefined ? summaryData.profit : totalIncome - totalExpense;
  }
  
  // Render the component
  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl text-center">{t('dashboard.title')}</h1>
      
      {/* Show error if any */}
      {error !== '' && error !== null && (
        <Alert type="error" message={error} onClose={handleCloseError} />
      )}
      
      {/* Show spinner while loading */}
      {isLoading === true ? (
        <div className="flex justify-center py-12">
          <Spinner size="large" />
        </div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Income Card */}
            <SummaryCard 
              title={t('financial.totalIncome')} 
              amount={totalIncome} 
              icon={<FaMoneyBillWave className="h-6 w-6" />} 
              change={12.5} 
            />
            
            {/* Expenses Card */}
            <SummaryCard 
              title={t('financial.totalExpenses')} 
              amount={totalExpense} 
              icon={<FaReceipt className="h-6 w-6" />} 
              change={-4.2} 
            />
            
            {/* Profit Card */}
            <SummaryCard 
              title={t('financial.netProfitLoss')} 
              amount={profit} 
              icon={<FaChartLine className="h-6 w-6" />} 
              change={8.7} 
              isProfit={profit > 0}
            />
          </div>
          
          {/* Finance Chart - only show if we have data */}
          {monthlyData !== null && monthlyData !== undefined && (
            <div className="mt-6">
              <FinanceChart data={monthlyData} />
            </div>
          )}
          
          {/* Stats and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Financial Insights */}
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
                    {profit > 0 
                      ? t('dashboard.profitableMsg', { percent: ((profit / totalIncome) * 100).toFixed(1) })
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
                    {t('dashboard.highestProfitMonth', { month: getHighestProfitMonth() })}
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
            
            {/* Recommendations */}
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
        </div>
      )}
    </div>
  );
  
  // Helper function to get the month with highest profit
  function getHighestProfitMonth() {
    // Check if we have monthly data
    if (!monthlyData || monthlyData.length === 0) {
      console.log('No monthly data available');
      return t('common.notAvailable');
    }
    
    // Variables to track highest profit
    let highestProfit = -Infinity;
    let highestMonth = '';
    
    // Loop through all months
    for (let i = 0; i < monthlyData.length; i++) {
      // Get current month data
      const currentMonth = monthlyData[i];
      
      // Check if this month has higher profit
      if (currentMonth.profit > highestProfit) {
        // Update highest profit and month
        highestProfit = currentMonth.profit;
        highestMonth = currentMonth.month;
        
        // Log for debugging (a junior might add this)
        console.log('New highest profit month:', highestMonth, 'with profit:', highestProfit);
      }
    }
    
    // Return the month with highest profit
    return highestMonth || t('common.notAvailable');
  }
}

// Export the component
export default HomePage; 