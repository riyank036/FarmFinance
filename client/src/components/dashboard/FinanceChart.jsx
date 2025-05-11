import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthName } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const FinanceChart = ({ data }) => {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Format data for the chart
  const formattedData = data?.map(item => ({
    ...item,
    month: getMonthName(item.month).substring(0, 3),
  })) || [];

  // Custom tooltip to display values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} p-2 sm:p-3 shadow-md rounded-md border text-xs sm:text-sm`}>
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p 
              key={`item-${index}`} 
              style={{ color: entry.color }}
              className="text-xs sm:text-sm"
            >
              {`${entry.name}: ₹${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };

  // Use reduced margins and simplified view on mobile
  const chartMargins = isMobile 
    ? { top: 5, right: 10, left: 0, bottom: 5 } 
    : { top: 5, right: 30, left: 20, bottom: 5 };

  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700 h-64 sm:h-80 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 sm:mb-4 heading-text">{t('dashboard.monthlyOverview')}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={formattedData}
          margin={chartMargins}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: darkMode ? "#9ca3af" : "#4b5563", fontSize: isMobile ? 10 : 12 }}
            tickMargin={5}
          />
          <YAxis 
            tick={{ fill: darkMode ? "#9ca3af" : "#4b5563", fontSize: isMobile ? 10 : 12 }} 
            width={isMobile ? 30 : 40}
            tickFormatter={value => isMobile ? (value >= 1000 ? `${(value/1000).toFixed(0)}k` : value) : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: darkMode ? "#ffffff" : "#000000", fontSize: isMobile ? 10 : 12 }}
            iconSize={isMobile ? 8 : 10}
          />
          <Bar dataKey="income" name={t('financial.income')} fill="#22c55e" />
          <Bar dataKey="expenses" name={t('financial.expenses')} fill="#ef4444" />
          <Bar dataKey="profit" name={t('financial.profit')} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;