import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../core/api/axiosConfig';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { FaUsers, FaExchangeAlt, FaChartBar, FaSpinner } from 'react-icons/fa';
import { ADMIN_ENDPOINTS } from '../../../core/config/apiConfig';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfitLoss: 0,
    usersCount: 0,
    expensesCount: 0,
    incomeCount: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary data
        const summaryRes = await axios.get(ADMIN_ENDPOINTS.STATS);
        
        // Fetch monthly data
        const monthlyRes = await axios.get(ADMIN_ENDPOINTS.MONTHLY_STATS);
        
        if (summaryRes.data.success && monthlyRes.data.success) {
          const { finances, users } = summaryRes.data.stats;
          
          setSummaryData({
            totalIncome: finances.totalIncome,
            totalExpenses: finances.totalExpenses,
            netProfitLoss: finances.netBalance,
            usersCount: users.total,
            expensesCount: finances.expensesCount,
            incomeCount: finances.incomeCount
          });
          
          // Process monthly data for charts
          const processedMonthlyData = monthlyRes.data.monthlyData.map(item => ({
            name: item.monthName,
            income: item.income || 0,
            expenses: item.expenses || 0,
            profit: (item.income || 0) - (item.expenses || 0)
          }));
          
          setMonthlyData(processedMonthlyData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Income</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(summaryData.totalIncome)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            From {summaryData.incomeCount} transactions
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(summaryData.totalExpenses)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            From {summaryData.expensesCount} transactions
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Net Profit/Loss</h2>
          <p className={`text-3xl font-bold ${
            summaryData.netProfitLoss >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(summaryData.netProfitLoss)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {summaryData.netProfitLoss >= 0 ? 'Profit' : 'Loss'}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly Income vs. Expenses</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly Net Profit/Loss</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="profit" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-indigo-600 text-white p-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          <div className="flex items-center">
            <FaUsers className="text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg">User Management</h3>
              <p className="text-indigo-100">{summaryData.usersCount} registered users</p>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/transactions" className="bg-purple-600 text-white p-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors">
          <div className="flex items-center">
            <FaExchangeAlt className="text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg">Transaction Management</h3>
              <p className="text-purple-100">{summaryData.incomeCount + summaryData.expensesCount} total transactions</p>
            </div>
          </div>
        </Link>
        
        <Link to="/admin/monthly" className="bg-teal-600 text-white p-4 rounded-lg shadow-md hover:bg-teal-700 transition-colors">
          <div className="flex items-center">
            <FaChartBar className="text-3xl mr-4" />
            <div>
              <h3 className="font-semibold text-lg">Monthly Financial Data</h3>
              <p className="text-teal-100">View detailed monthly reports</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard; 