import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { expenseAPI } from '../../core/api/api.js';
import Alert from '../ui/Alert';
import Spinner from '../../shared/components/ui/Spinner.jsx';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ExpenseForm = ({ onSuccess, initialData }) => {
  const { t } = useTranslation();
  // We use darkMode in className conditionals below
  const { darkMode } = useTheme(); // eslint-disable-line no-unused-vars
  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    amount: initialData?.amount || '',
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    note: initialData?.note || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customCategoryError, setCustomCategoryError] = useState('');
  
  // List of common expense categories for Indian farmers
  const categories = [
    'Seeds & Plants',
    'Fertilizers',
    'Pesticides',
    'Electricity & Water',
    'Labor',
    'Machinery Rental',
    'Equipment Maintenance',
    'Fuel',
    'Transportation',
    'Storage & Warehousing',
    'Land Lease',
    'Loan Interest',
    'Insurance',
    'Animal Feed',
    'Crop Protection',
    'MSP Registration',
    'Market Fees',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };
  
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      // If custom is selected, set category to empty temporarily while we wait for custom input
      setFormData(prev => ({
        ...prev,
        category: 'custom'  // Using 'custom' as a temporary placeholder
      }));
      setCustomCategory('');
    } else {
      setFormData(prev => ({
        ...prev,
        category: value
      }));
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    
    // Validate that input contains only English characters
    if (/[^\u0000-\u007F]/.test(value)) {
      setCustomCategoryError(t('common.englishInputOnly'));
    } else {
      setCustomCategoryError('');
    }
  };

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim() && !customCategoryError) {
      // Set the actual custom value as the category instead of keeping "custom"
      setFormData(prev => ({
        ...prev,
        category: customCategory.trim()
      }));
      setCustomCategory('');
      setCustomCategoryError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if the category is still set to "custom" placeholder
    if (formData.category === 'custom') {
      setError(t('expenses.enterCustomCategory'));
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (initialData?._id) {
        // Update existing expense
        await expenseAPI.updateExpense(initialData._id, formData);
        setSuccess(t('expenses.updateSuccess'));
      } else {
        // Create new expense
        await expenseAPI.createExpense(formData);
        setSuccess(t('expenses.addSuccess'));
        // Reset form for new entries
        setFormData({
          category: '',
          amount: '',
          date: new Date(),
          note: ''
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.message || t('expenses.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 heading-text">
        {initialData ? t('expenses.edit') : t('expenses.addNew')}
      </h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category" className="form-label dark:text-gray-300">{t('expenses.category')}</label>
          <select
            id="category"
            name="category"
            value={formData.category === 'custom' ? 'custom' : formData.category}
            onChange={handleCategoryChange}
            className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">{t('expenses.selectCategory')}</option>
            
            <option disabled>--- {t('expenses.cropRelated')} ---</option>
            <option value="Seeds & Plants">Seeds & Plants</option>
            <option value="Fertilizers">Fertilizers</option>
            <option value="Pesticides">Pesticides</option>
            <option value="Crop Protection">Crop Protection</option>
            
            <option disabled>--- {t('expenses.utilities')} ---</option>
            <option value="Electricity & Water">Electricity & Water</option>
            <option value="Fuel">Fuel</option>
            
            <option disabled>--- {t('expenses.labor')} ---</option>
            <option value="Labor">Labor</option>
            
            <option disabled>--- {t('expenses.equipment')} ---</option>
            <option value="Machinery Rental">Machinery Rental</option>
            <option value="Equipment Maintenance">Equipment Maintenance</option>
            
            <option disabled>--- {t('expenses.logistics')} ---</option>
            <option value="Transportation">Transportation</option>
            <option value="Storage & Warehousing">Storage & Warehousing</option>
            
            <option disabled>--- {t('expenses.finance')} ---</option>
            <option value="Land Lease">Land Lease</option>
            <option value="Loan Interest">Loan Interest</option>
            <option value="Insurance">Insurance</option>
            <option value="MSP Registration">MSP Registration</option>
            <option value="Market Fees">Market Fees</option>
            
            <option disabled>--- {t('expenses.livestock')} ---</option>
            <option value="Animal Feed">Animal Feed</option>
            
            <option disabled>--- {t('expenses.other')} ---</option>
            <option value="Other">Other</option>
            <option value="custom">{t('expenses.addCustomCategory')}</option>
            
            {/* Add a dynamic option for the custom category if it's not empty and not in the list */}
            {formData.category && 
              formData.category !== 'custom' && 
              !categories.includes(formData.category) && 
              <option value={formData.category}>{formData.category}</option>
            }
          </select>
          
          {formData.category === 'custom' && (
            <div className="mt-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder={t('expenses.enterCustomCategory')}
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
                />
                <button
                  type="button"
                  onClick={handleCustomCategorySubmit}
                  className="ml-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {t('common.add')}
                </button>
              </div>
              <div className="mt-1 text-xs text-red-500 dark:text-red-400">
                {t('common.englishInputOnly')}
              </div>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="amount" className="form-label dark:text-gray-300">{t('expenses.amount')} (₹)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date" className="form-label dark:text-gray-300">{t('expenses.date')}</label>
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            dateFormat="MMMM d, yyyy"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="note" className="form-label dark:text-gray-300">{t('expenses.noteOptional')}</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="form-input h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={t('expenses.notePlaceholder')}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Spinner size="small" color="white" />
                <span className="ml-2">{t('expenses.saving')}</span>
              </span>
            ) : initialData ? t('expenses.updateExpense') : t('expenses.addExpense')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm; 