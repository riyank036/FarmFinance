import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../core/api/axiosConfig';
import { FaCommentAlt, FaPaperPlane } from 'react-icons/fa';
import { FEEDBACK_ENDPOINTS } from '../../core/config/apiConfig';
import useAuth from '../../hooks/useAuth';

const Feedback = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    category: 'General Feedback'
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      setError('You must be logged in to submit feedback.');
    } else {
      setError(null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAuth = async () => {
    if (!user || !user.id) {
      return false;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    return true;
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
      // Check authentication
      const isAuthenticated = await validateAuth();
      if (!isAuthenticated) {
        setError('Authentication error. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Submit feedback
      const response = await axios({
        method: 'post',
        url: FEEDBACK_ENDPOINTS.BASE,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      console.error('Feedback submission error:', error);
      
      if (error.response) {
        // Handle specific error codes
        if (error.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(error.response.data?.message || t('feedback.failed'));
        }
      } else {
        setError('Connection error. Please try again later.');
      }
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
            disabled={isSubmitting || !user}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
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