import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

// This component shows a chart of finance data
const FinanceChart = ({ data }) => {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile size
  useEffect(() => {
    function checkIfMobile() {
      setIsMobile(window.innerWidth < 640);
    }
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Format the data for the chart
  let formattedData = [];
  
  if (data) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let monthName = getMonthName(item.month);
      let shortMonth = monthName.substring(0, 3);
      
      formattedData.push({
        month: shortMonth,
        income: item.income,
        expenses: item.expenses,
        profit: item.profit
      });
    }
  }

  // Function to get month name
  function getMonthName(monthNum) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    if (monthNum >= 1 && monthNum <= 12) {
      return months[monthNum - 1];
    } else {
      return "";
    }
  }

  return (
    <div className={darkMode ? "card dark:bg-gray-800 dark:border-gray-700 h-64 sm:h-80 p-4 sm:p-6" : "card bg-white h-64 sm:h-80 p-4 sm:p-6"}>
      <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 sm:mb-4 heading-text">{t('dashboard.monthlyOverview')}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" name={t('financial.income')} fill="#22c55e" />
          <Bar dataKey="expenses" name={t('financial.expenses')} fill="#ef4444" />
          <Bar dataKey="profit" name={t('financial.profit')} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;