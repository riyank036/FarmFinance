import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaSave } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSettings = ({ user, updateProfile }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    preferences: {
      language: currentLanguage || 'en'
    }
  });

  // Update form when language changes externally
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language: currentLanguage
      }
    }));
  }, [currentLanguage]);

  const handleLanguageChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language: value
      }
    }));
    
    // Remove immediate language change
    // changeLanguage will be called only on form submission
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        // Apply language change only after successful save
        if (formData.preferences.language !== currentLanguage) {
          changeLanguage(formData.preferences.language);
        }
        
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || t('settings.failed'));
      }
    } catch (error) {
      setError(error.message || t('settings.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
          <FaGlobe className="mr-2" /> {t('settings.language')}
        </h3>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {t('settings.updated')}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <FaGlobe className="mr-2" /> {t('settings.language')}
            </label>
            <select
              id="language"
              name="language"
              value={formData.preferences.language}
              onChange={handleLanguageChange}
              className="mt-2 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="en">{t('settings.english')}</option>
              <option value="hi">{t('settings.hindi')}</option>
              <option value="gu">{t('settings.gujarati')}</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('settings.languageNote')}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                {t('settings.saving') || 'Saving...'}
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> {t('settings.saveSettings')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LanguageSettings;