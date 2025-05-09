import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ExpenseForm from '../components/expenses/ExpenseForm';

const AddExpensePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Redirect to expenses list after a short delay to show success message
    setTimeout(() => {
      navigate('/expenses');
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl text-center">{t('expenses.addNew')}</h1>
      
      <ExpenseForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddExpensePage; 