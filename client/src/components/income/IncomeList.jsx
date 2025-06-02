import { useState } from 'react';
import { FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Spinner from '../../shared/components/ui/Spinner.jsx';
import Alert from '../ui/Alert';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const IncomeList = ({ incomes, isLoading, onDelete, onEdit, pagination, onPageChange }) => {
  const { t } = useTranslation();
  // We use darkMode indirectly through className conditionals
  const { darkMode } = useTheme(); // eslint-disable-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  
  // Filter incomes based on search term
  const filteredIncomes = incomes?.filter(income => {
    const searchLower = searchTerm.toLowerCase();
    return (
      income.product.toLowerCase().includes(searchLower) ||
      income.note?.toLowerCase().includes(searchLower) ||
      formatCurrency(income.totalAmount).toLowerCase().includes(searchLower)
    );
  }) || [];

  // Handle delete confirmation
  const handleDelete = (income) => {
    if (window.confirm(t('income.confirmDelete', { product: income.product, amount: formatCurrency(income.totalAmount) }))) {
      onDelete(income._id);
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
        {t('income.title')}
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
          placeholder={t('income.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredIncomes.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          {incomes?.length === 0 
            ? t('income.noIncomeRecords')
            : t('income.noSearchResults')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.product')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.quantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.rate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.total')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.note')}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('income.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIncomes.map((income) => (
                <tr key={income._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {income.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {income.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(income.ratePerUnit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {formatCurrency(income.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(income.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {income.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEdit(income)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title={t('income.edit')}
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(income)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title={t('income.delete')}
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

export default IncomeList; 