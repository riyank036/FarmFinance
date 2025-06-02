import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import IncomeList from '../components/income/IncomeList';
import IncomeForm from '../components/income/IncomeForm';
import Alert from '../components/ui/Alert';
import { incomeAPI } from '../core/api/api.js';


const IncomePage = () => {
  const { t } = useTranslation();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    pages: 1
  });
  
  // Fetch income entries when component mounts
  useEffect(() => {
    fetchIncomes();
  }, [pagination.page]);
  
  // Fetch all income entries
  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await incomeAPI.getIncomes(pagination.page, pagination.limit);
      
      if (response.success) {
        setIncomes(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      setError(t('income.loadError'));
      console.error('Income fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  };
  
  // Delete an income entry
  const handleDelete = async (incomeId) => {
    try {
      setError('');
      await incomeAPI.deleteIncome(incomeId);
      setIncomes(incomes.filter(income => income._id !== incomeId));
    } catch (error) {
      setError(t('income.deleteError'));
      console.error('Income delete error:', error);
    }
  };
  
  // Edit an income entry
  const handleEdit = (income) => {
    setSelectedIncome(income);
    setIsEditing(true);
  };
  
  // Handle edit form success
  const handleEditSuccess = () => {
    setIsEditing(false);
    setSelectedIncome(null);
    fetchIncomes();
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedIncome(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl text-center">{t('income.title')}</h1>
        <Link to="/add-income" className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" /> {t('income.addIncome')}
        </Link>
      </div>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      {isEditing ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold heading-text w-full">{t('income.edit')}</h2>
            <button 
              onClick={handleCancelEdit}
              className="text-gray-600 hover:text-gray-900"
            >
              {t('common.cancel')}
            </button>
          </div>
          <IncomeForm 
            initialData={selectedIncome} 
            onSuccess={handleEditSuccess} 
          />
        </div>
      ) : (
        <IncomeList 
          incomes={incomes}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default IncomePage; 