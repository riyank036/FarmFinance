import { useState, useEffect } from 'react';
import axios from '../../../core/api/axiosConfig';
import { FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import { ADMIN_ENDPOINTS } from '../../../core/config/apiConfig';

const MonthlyFinancialData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [years, setYears] = useState([]);

  useEffect(() => {
    // Generate list of years (current year and 5 years back)
    const currentYear = new Date().getFullYear();
    const yearsList = Array.from({ length: 6 }, (_, i) => currentYear - i);
    setYears(yearsList);
    
    fetchMonthlyData(selectedYear);
  }, []);

  const fetchMonthlyData = async (year) => {
    try {
      setLoading(true);
      
      // Fetch monthly financial data
      const response = await axios.get(`${ADMIN_ENDPOINTS.MONTHLY_STATS}?year=${year}`);
      
      if (response.data.success) {
        setMonthlyData(response.data.monthlyData);
      } else {
        setError('Failed to load monthly financial data');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      setError('Error loading monthly financial data. Please try again later.');
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    fetchMonthlyData(year);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter data based on selected month
  const filteredData = selectedMonth === 'all' 
    ? monthlyData 
    : monthlyData.filter(item => item.month === parseInt(selectedMonth));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monthly Financial Data</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex items-center mb-2">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold">Filter by Period</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={selectedYear}
              onChange={handleYearChange}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
        </div>
      </div>

      {/* Monthly Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredData.length > 0 ? (
          filteredData.map((month) => (
            <div key={month.month} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                {month.monthName} {selectedYear}
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Income:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(month.income || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(month.expenses || 0)}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Net Profit/Loss:</span>
                    <span className={`font-bold ${
                      (month.income || 0) - (month.expenses || 0) >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency((month.income || 0) - (month.expenses || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
            No financial data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyFinancialData; 