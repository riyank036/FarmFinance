import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthName } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const FinanceChart = ({ data }) => {
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  
  // Format data for the chart
  const formattedData = data?.map(item => ({
    ...item,
    month: getMonthName(item.month).substring(0, 3),
  })) || [];

  // Custom tooltip to display values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'} p-3 shadow-md rounded-md border`}>
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p 
              key={`item-${index}`} 
              style={{ color: entry.color }}
              className="text-sm"
            >
              {`${entry.name}: ₹${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700 h-80">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4 heading-text">{t('dashboard.monthlyOverview')}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
          <XAxis dataKey="month" tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
          <YAxis tick={{ fill: darkMode ? "#9ca3af" : "#4b5563" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: darkMode ? "#ffffff" : "#000000" }} />
          <Bar dataKey="income" name={t('financial.income')} fill="#22c55e" />
          <Bar dataKey="expenses" name={t('financial.expenses')} fill="#ef4444" />
          <Bar dataKey="profit" name={t('financial.profit')} fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart; 