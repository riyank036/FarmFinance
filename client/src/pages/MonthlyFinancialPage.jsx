import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../core/api/api';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import MonthlyFinancialSummary from '../components/financial/MonthlyFinancialSummary';
import TransactionsList from '../components/financial/TransactionsList';
import Alert from '../components/ui/Alert';
import Spinner from '../shared/components/ui/Spinner';

const MonthlyFinancialPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await userAPI.getMonthlyFinancialData(user.id);
        setMonthlyData(response.data);
        
        // Set the most recent month as selected by default
        if (response.data.length > 0) {
          setSelectedMonth(response.data[0]);
        }
      } catch (err) {
        setError(err.message || t('financial.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMonthlyData();
    }
  }, [user?.id, t]);

  const handleMonthSelect = (month) => {
    const selected = monthlyData.find(m => m.month === month);
    if (selected) {
      setSelectedMonth(selected);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">{t('financial.monthlyTitle')}</h1>
      
      {monthlyData.length === 0 ? (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
          <p>{t('financial.noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Month selector */}
          <div className={`lg:col-span-3 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
            <h2 className="text-lg font-semibold mb-4">{t('financial.selectMonth')}</h2>
            <div className="space-y-2">
              {monthlyData.map((month) => (
                <button
                  key={month.month}
                  onClick={() => handleMonthSelect(month.month)}
                  className={`w-full text-left p-2 rounded ${
                    selectedMonth?.month === month.month
                      ? darkMode
                        ? 'bg-indigo-800 text-white'
                        : 'bg-indigo-100 text-indigo-800'
                      : darkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{month.monthName} {month.year}</div>
                  <div className={`text-sm ${
                    month.netProfit >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                    {month.netProfit >= 0 ? '+' : ''}{formatCurrency(month.netProfit)}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Selected month details */}
          <div className="lg:col-span-9 space-y-6">
            {selectedMonth && (
              <>
                {/* Financial summary */}
                <MonthlyFinancialSummary data={selectedMonth} />
                
                {/* Recent transactions */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
                  <h2 className="text-lg font-semibold mb-4">
                    {t('financial.recentTransactions')} - {selectedMonth.monthName} {selectedMonth.year}
                  </h2>
                  <TransactionsList transactions={selectedMonth.transactions} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyFinancialPage; 