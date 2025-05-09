import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { FaCommentAlt, FaPaperPlane } from 'react-icons/fa';
import { FEEDBACK_ENDPOINTS } from '../../core/config/apiConfig';

const Feedback = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    category: 'General Feedback'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setError(t('feedback.messageRequired'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await axios.post(FEEDBACK_ENDPOINTS.BASE, formData);
      
      if (response.data.success) {
        setSuccess(true);
        // Reset the form
        setFormData({
          message: '',
          category: 'General Feedback'
        });
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(response.data.message || t('feedback.failed'));
      }
    } catch (error) {
      setError(error.response?.data?.message || t('feedback.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
          <FaCommentAlt className="mr-2" /> {t('profile.feedbackSupport')}
        </h3>
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {t('feedback.submitted')}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('feedback.category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="Bug Report">{t('feedback.bugReport')}</option>
              <option value="Feature Request">{t('feedback.featureRequest')}</option>
              <option value="General Feedback">{t('feedback.generalFeedback')}</option>
              <option value="Support">{t('feedback.support')}</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('feedback.message')}
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                placeholder={t('feedback.messagePlaceholder')}
                required
              ></textarea>
            </div>
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
                {t('feedback.sending') || 'Sending...'}
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" /> {t('feedback.submit')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback; 