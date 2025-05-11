import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../../core/config/apiConfig.js';

const PersonalDetails = ({ user, updateProfile }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [localUser, setLocalUser] = useState(user);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    phoneNumber: user?.phoneNumber || '',
    location: {
      village: user?.location?.village || '',
      district: user?.location?.district || '',
      state: user?.location?.state || ''
    }
  });

  // Fetch the latest user data directly
  const fetchUserData = async () => {
    try {
      const res = await axios.get(AUTH_ENDPOINTS.ME);
      if (res.data.success) {
        setLocalUser(res.data.user);
        setFormData({
          username: res.data.user.username || '',
          phoneNumber: res.data.user.phoneNumber || '',
          location: {
            village: res.data.user.location?.village || '',
            district: res.data.user.location?.district || '',
            state: res.data.user.location?.state || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      // Create a deep copy of the user data to ensure all fields are properly captured
      setFormData({
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        location: {
          village: user.location?.village || '',
          district: user.location?.district || '',
          state: user.location?.state || ''
        }
      });
      
      // Log user data to verify it's properly received
      console.log('User data updated in PersonalDetails:', user);
      setLocalUser(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess(true);
        setLocalUser(result.user);
        setTimeout(() => {
          setIsEditing(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || t('personal.failed'));
      }
    } catch (error) {
      setError(error.message || t('personal.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
      <div className="flex justify-between items-center px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {t('profile.personalDetails')}
        </h3>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('personal.edit')}
          </button>
        ) : null}
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {t('personal.updated')}
        </div>
      )}
      
      {!isEditing ? (
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <FaUser className="mr-2" /> {t('personal.name')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {localUser?.username || '-'}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <FaEnvelope className="mr-2" /> {t('personal.email')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {localUser?.email || '-'}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <FaPhone className="mr-2" /> {t('personal.phoneNumber')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {localUser?.phoneNumber || '-'}
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> {t('personal.location')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {localUser?.location?.village && localUser?.location?.district && localUser?.location?.state
                  ? `${localUser.location.village}, ${localUser.location.district}, ${localUser.location.state}`
                  : '-'
                }
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('personal.name')}
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('personal.email')}
              </label>
              <input
                type="email"
                id="email"
                value={localUser?.email || ''}
                disabled
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 rounded-md bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('personal.emailReadOnly')}
              </p>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('personal.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('personal.location')}
              </label>
              
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-4">
                <div>
                  <label htmlFor="location.village" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('personal.village')}
                  </label>
                  <input
                    type="text"
                    name="location.village"
                    id="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="location.district" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('personal.district')}
                  </label>
                  <input
                    type="text"
                    name="location.district"
                    id="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="location.state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('personal.state')}
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    id="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('personal.cancel')}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('personal.saving') || 'Saving...'}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> {t('personal.saveChanges')}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PersonalDetails; 