import { useState, useEffect } from 'react';
import axios from '../../../core/api/axiosConfig';
import { FaSpinner, FaTrash, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { ADMIN_ENDPOINTS } from '../../../core/config/apiConfig';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'income', 'expense'
  const [userFilter, setUserFilter] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch both income and expense transactions
      const incomeRes = await axios.get(ADMIN_ENDPOINTS.INCOME);
      const expensesRes = await axios.get(ADMIN_ENDPOINTS.EXPENSES);
      
      if (incomeRes.data.success && expensesRes.data.success) {
        // Format income transactions
        const incomeTransactions = incomeRes.data.income.map(item => ({
          ...item,
          type: 'income',
          amount: item.totalAmount,
          crop: item.product, // Map product to crop for consistency
          date: new Date(item.date),
          formattedDate: new Date(item.date).toLocaleDateString(),
          username: item.user?.username || 'Unknown'
        }));
        
        // Format expense transactions
        const expenseTransactions = expensesRes.data.expenses.map(item => ({
          ...item,
          type: 'expense',
          crop: item.category, // Map category to crop for consistency
          date: new Date(item.date),
          formattedDate: new Date(item.date).toLocaleDateString(),
          username: item.user?.username || 'Unknown'
        }));
        
        // Combine and sort by date (newest first)
        const allTransactions = [...incomeTransactions, ...expenseTransactions]
          .sort((a, b) => b.date - a.date);
        
        setTransactions(allTransactions);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions data');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.USERS);
      
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    
    try {
      const endpoint = transactionToDelete.type === 'income' 
        ? `${ADMIN_ENDPOINTS.INCOME}/${transactionToDelete._id}`
        : `${ADMIN_ENDPOINTS.EXPENSES}/${transactionToDelete._id}`;
      
      const response = await axios.delete(endpoint);
      
      if (response.data.success) {
        // Remove transaction from the list
        setTransactions(transactions.filter(t => 
          !(t._id === transactionToDelete._id && t.type === transactionToDelete.type)
        ));
        setShowDeleteModal(false);
        setTransactionToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
    }
  };

  // Apply filters to transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Type filter
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    
    // User filter
    if (userFilter && transaction.user?._id !== userFilter) {
      return false;
    }
    
    // Date range filter
    if (dateRange.startDate && new Date(transaction.date) < new Date(dateRange.startDate)) {
      return false;
    }
    
    if (dateRange.endDate && new Date(transaction.date) > new Date(dateRange.endDate)) {
      return false;
    }
    
    return true;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const resetFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    setTypeFilter('all');
    setUserFilter('');
  };

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
        <h1 className="text-2xl font-bold">Transaction Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex items-center mb-2">
          <FaFilter className="text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaCalendarAlt className="inline mr-1" /> Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
          
          {/* Transaction Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
          
          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              User
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount (₹)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Crop/Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr key={`${transaction.type}-${transaction._id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white">{transaction.formattedDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500 dark:text-gray-400">{transaction.crop || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500 dark:text-gray-400">{transaction.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => {
                        setTransactionToDelete(transaction);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No transactions found matching the filter criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Confirm Deletion</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this {transactionToDelete.type} transaction of {formatCurrency(transactionToDelete.amount)}? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTransactionToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDeleteTransaction}
              >
                Delete Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement; 