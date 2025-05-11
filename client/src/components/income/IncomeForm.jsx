import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { incomeAPI } from '../../core/api/api.js';
import Alert from '../ui/Alert';
import Spinner from '../../shared/components/ui/Spinner.jsx';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const IncomeForm = ({ onSuccess, initialData }) => {
  const { darkMode } = useTheme(); // eslint-disable-line no-unused-vars
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    product: initialData?.product || '',
    quantity: initialData?.quantity || '',
    ratePerUnit: initialData?.ratePerUnit || '',
    totalAmount: initialData?.totalAmount || '',
    date: initialData?.date ? new Date(initialData.date) : new Date(),
    note: initialData?.note || '',
    isManualTotal: initialData?.isManualTotal || false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  
  // List of common Indian agricultural products
  const products = [
    // Grains & Cereals
    'Rice',
    'Wheat',
    'Corn',
    'Bajra',
    'Jowar',
    
    // Pulses
    'Chickpeas/Chana',
    'Pigeon Peas/Tur Dal',
    'Green Gram/Moong Dal',
    'Black Gram/Urad Dal',
    'Lentils/Masoor Dal',
    
    // Commercial Crops
    'Sugarcane',
    'Cotton',
    'Oilseeds',
    'Tobacco',
    
    // Vegetables
    'Chili','Brinjal',
    'Tomato',
    'Onion',
    
    'Cauliflower',
    'Cabbage',
    'ladyfinger/Bhinda',
    'Leafy Vegetables',
    'Other Vegetables',
    
    // Fruits
    'Mango',
    'Banana',
    'Grapes',
    'Papaya',
    'Guava',
    'Other Fruits',
    
    // Animal Products
    'Milk',
    'Eggs',
    'Poultry',
    'Meat',
    'Fish',
    'Honey',
    
    // Other
    'Herbs & Medicinal Plants',
    'Custom'
  ];
  
  // Calculate total amount when quantity or rate changes
  useEffect(() => {
    if (formData.quantity && formData.ratePerUnit && !formData.isManualTotal) {
      setFormData(prev => ({
        ...prev,
        totalAmount: (parseFloat(prev.quantity) * parseFloat(prev.ratePerUnit)).toFixed(2)
      }));
    }
  }, [formData.quantity, formData.ratePerUnit, formData.isManualTotal]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['quantity', 'ratePerUnit', 'totalAmount'].includes(name) 
        ? (value === '' ? '' : parseFloat(value)) 
        : value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };
  
  const handleProductChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      // If custom is selected, set product to 'custom' temporarily while we wait for custom input
      setFormData(prev => ({
        ...prev,
        product: 'custom'  // Using 'custom' as a temporary placeholder
      }));
      setCustomProduct('');
    } else {
      setFormData(prev => ({
        ...prev,
        product: value
      }));
    }
  };

  const handleCustomProductChange = (e) => {
    setCustomProduct(e.target.value);
  };

  const handleCustomProductSubmit = () => {
    if (customProduct.trim()) {
      // Set the actual custom value as the product instead of keeping "custom"
      setFormData(prev => ({
        ...prev,
        product: customProduct.trim()
      }));
      setCustomProduct('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if the product is still set to "custom" placeholder
    if (formData.product === 'custom') {
      setError(t('income.enterCustomProduct'));
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      if (initialData?._id) {
        // Update existing income
        await incomeAPI.updateIncome(initialData._id, formData);
        setSuccess(t('income.updateSuccess'));
      } else {
        // Create new income record
        await incomeAPI.createIncome(formData);
        setSuccess(t('income.addSuccess'));
        // Reset form for new entries
        setFormData({
          product: '',
          quantity: '',
          ratePerUnit: '',
          totalAmount: '',
          date: new Date(),
          note: '',
          isManualTotal: false
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(error.message || t('income.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 heading-text">
        {initialData ? t('income.edit') : t('income.addNew')}
      </h2>
      
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product" className="form-label dark:text-gray-300">{t('income.product')}</label>
          <select
            id="product"
            name="product"
            value={formData.product === 'custom' ? 'custom' : formData.product}
            onChange={handleProductChange}
            className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">{t('income.selectProduct')}</option>
            
            <option disabled>--- {t('income.grainsCereals')} ---</option>
            <option value="Rice">Rice</option>
            <option value="Wheat">Wheat</option>
            <option value="Corn">Corn</option>
            <option value="Bajra">Bajra</option>
            <option value="Jowar">Jowar</option>
            
            <option disabled>--- {t('income.pulses')} ---</option>
            <option value="Chickpeas/Chana">Chickpeas/Chana</option>
            <option value="Pigeon Peas/Tur Dal">Pigeon Peas/Tur Dal</option>
            <option value="Green Gram/Moong Dal">Green Gram/Moong Dal</option>
            <option value="Black Gram/Urad Dal">Black Gram/Urad Dal</option>
            <option value="Lentils/Masoor Dal">Lentils/Masoor Dal</option>
            
            <option disabled>--- {t('income.commercialCrops')} ---</option>
            <option value="Sugarcane">Sugarcane</option>
            <option value="Cotton">Cotton</option>
            <option value="Oilseeds">Oilseeds</option>
            <option value="Tobacco">Tobacco</option>
            
            <option disabled>--- {t('income.vegetables')} ---</option>
            <option value="Chili">Chili</option>
            <option value="Brinjal">Brinjal</option>
            <option value="Tomato">Tomato</option>
            <option value="Onion">Onion</option>
            <option value="Cauliflower">Cauliflower</option>
            <option value="Cabbage">Cabbage</option>
            <option value="ladyfinger/Bhinda">ladyfinger/Bhinda</option>
            <option value="Leafy Vegetables">Leafy Vegetables</option>
            <option value="Other Vegetables">Other Vegetables</option>
            
            <option disabled>--- {t('income.fruits')} ---</option>
            <option value="Mango">Mango</option>
            <option value="Banana">Banana</option>
            <option value="Grapes">Grapes</option>
            <option value="Papaya">Papaya</option>
            <option value="Guava">Guava</option>
            <option value="Other Fruits">Other Fruits</option>
            
            <option disabled>--- {t('income.animalProducts')} ---</option>
            <option value="Milk">Milk</option>
            <option value="Eggs">Eggs</option>
            <option value="Poultry">Poultry</option>
            <option value="Meat">Meat</option>
            <option value="Fish">Fish</option>
            <option value="Honey">Honey</option>
            
            <option disabled>--- {t('income.other')} ---</option>
            <option value="Herbs & Medicinal Plants">Herbs & Medicinal Plants</option>
            <option value="custom">{t('income.addCustomProduct')}</option>
            
            {/* Add a dynamic option for the custom product if it's not empty and not in the list */}
            {formData.product && 
              formData.product !== 'custom' && 
              !products.includes(formData.product) && 
              <option value={formData.product}>{formData.product}</option>
            }
          </select>
          
          {formData.product === 'custom' && (
            <div className="mt-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder={t('income.enterCustomProduct')}
                  value={customProduct}
                  onChange={handleCustomProductChange}
                  className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
                />
                <button
                  type="button"
                  onClick={handleCustomProductSubmit}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="quantity" className="form-label dark:text-gray-300">{t('income.quantity')}</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ratePerUnit" className="form-label dark:text-gray-300">{t('income.rate')} (₹)</label>
            <input
              type="number"
              id="ratePerUnit"
              name="ratePerUnit"
              value={formData.ratePerUnit}
              onChange={handleChange}
              className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="totalAmount" className="form-label dark:text-gray-300">{t('income.total')} (₹)</label>
          <div className="flex flex-col space-y-2">
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              readOnly={!formData.isManualTotal}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isManualTotal"
                name="isManualTotal"
                checked={formData.isManualTotal}
                onChange={(e) => setFormData(prev => ({ ...prev, isManualTotal: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isManualTotal" className="text-sm text-gray-600 dark:text-gray-400">
                {t('income.enterTotalManually')}
              </label>
            </div>
            {formData.quantity && formData.ratePerUnit && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.quantity} {t('income.units')} × {formatCurrency(formData.ratePerUnit)} = {formatCurrency(formData.quantity * formData.ratePerUnit)}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="date" className="form-label dark:text-gray-300">{t('income.date')}</label>
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            className="form-input dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            dateFormat="MMMM d, yyyy"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="note" className="form-label dark:text-gray-300">{t('income.noteOptional')}</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="form-input h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={t('income.notePlaceholder')}
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
                <span className="ml-2">{t('income.saving')}</span>
              </span>
            ) : initialData ? t('income.updateIncome') : t('income.addIncome')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomeForm; 