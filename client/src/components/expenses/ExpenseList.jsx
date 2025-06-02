import { useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Spinner from '../../shared/components/ui/Spinner.jsx';
import Alert from '../ui/Alert';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ExpenseList = ({ expenses, isLoading, onDelete, onEdit, pagination, onPageChange }) => {
  const { t } = useTranslation();
  // We use darkMode indirectly through className conditionals
  const { darkMode } = useTheme(); // eslint-disable-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Filter expenses based on search term
  const filteredExpenses = expenses?.filter(expense => {
    const searchLower = searchTerm.toLowerCase();
    return (
      expense.category.toLowerCase().includes(searchLower) ||
      expense.note?.toLowerCase().includes(searchLower) ||
      formatCurrency(expense.amount).toLowerCase().includes(searchLower)
    );
  }) || [];

  // Handle delete confirmation
  const handleDelete = (expense) => {
    if (window.confirm(t('expenses.confirmDelete', { category: expense.category, amount: formatCurrency(expense.amount) }))) {
      onDelete(expense._id);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (onPageChange && newPage > 0 && newPage <= (pagination?.pages || 1)) {
      onPageChange(newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="card dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 heading-text">
        {t('expenses.title')}
      </h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      {/* Search bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="form-input pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder={t('expenses.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          {expenses?.length === 0 
            ? t('expenses.noExpenses')
            : t('expenses.noSearchResults')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('expenses.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('expenses.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('expenses.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('expenses.note')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('expenses.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {formatCurrency(expense.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {expense.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title={t('expenses.edit')}
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title={t('expenses.delete')}
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination controls */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded ${
                  pagination.page === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-label="Previous page"
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.pages}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className={`p-2 rounded ${
                  pagination.page === pagination.pages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-label="Next page"
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseList; 