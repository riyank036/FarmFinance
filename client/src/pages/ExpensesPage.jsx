import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Alert from '../components/ui/Alert';
import { expenseAPI } from '../core/api/api.js';

const ExpensesPage = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch expenses when component mounts
  useEffect(() => {
    fetchExpenses();
  }, []);
  
  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await expenseAPI.getExpenses();
      
      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      setError(t('expenses.loadError'));
      console.error('Expense fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete an expense
  const handleDelete = async (expenseId) => {
    try {
      setError('');
      await expenseAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter(expense => expense._id !== expenseId));
    } catch (error) {
      setError(t('expenses.deleteError'));
      console.error('Expense delete error:', error);
    }
  };
  
  // Edit an expense
  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsEditing(true);
  };
  
  // Handle edit form success
  const handleEditSuccess = () => {
    setIsEditing(false);
    setSelectedExpense(null);
    fetchExpenses();
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl text-center">{t('expenses.title')}</h1>
        <Link to="/add-expense" className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" /> {t('expenses.addExpense')}
        </Link>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      {isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold heading-text w-full">{t('expenses.edit')}</h2>
            <button 
              onClick={handleCancelEdit}
              className="text-gray-600 hover:text-gray-900"
            >
              {t('common.cancel')}
            </button>
          </div>
          <ExpenseForm 
            initialData={selectedExpense} 
            onSuccess={handleEditSuccess} 
          />
        </div>
      ) : (
        <ExpenseList 
          expenses={expenses}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default ExpensesPage; 