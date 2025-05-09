import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IncomeForm from '../components/income/IncomeForm';

const AddIncomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // Redirect to income list after a short delay to show success message
    setTimeout(() => {
      navigate('/income');
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl text-center">{t('income.addNew')}</h1>
      
      <IncomeForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddIncomePage; 