import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../core/config/apiConfig.js';

// Import profile components
import PersonalDetails from '../components/profile/PersonalDetails';
import FarmDetails from '../components/profile/FarmDetails';
import LanguageSettings from '../components/profile/Settings';
import Feedback from '../components/profile/Feedback';

// Import icons
import { FaUser, FaTractor, FaGlobe, FaCommentAlt, FaSignOutAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateProfile, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch latest user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      setIsRefreshing(true);
      try {
        const res = await axios.get(AUTH_ENDPOINTS.ME);
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchUserData();
  }, [setUser]);

  if (!user || isRefreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: t('profile.personalDetails'), icon: <FaUser /> },
    { id: 'farm', label: t('profile.farmDetails'), icon: <FaTractor /> },
    { id: 'settings', label: t('settings.language'), icon: <FaGlobe /> },
    { id: 'feedback', label: t('profile.feedbackSupport'), icon: <FaCommentAlt /> },
  ];

  const handleLogout = () => {
    logout();
    // The user will be redirected in the AuthContext after logout
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalDetails user={user} updateProfile={updateProfile} />;
      case 'farm':
        return <FarmDetails user={user} updateProfile={updateProfile} />;
      case 'settings':
        return <LanguageSettings user={user} updateProfile={updateProfile} />;
      case 'feedback':
        return <Feedback />;
      default:
        return <PersonalDetails user={user} updateProfile={updateProfile} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {t('profile.title')}
        </h1>
        
        {/* User info summary */}
        <div className="mt-2 sm:mt-0 flex items-center">
          <div className="bg-primary-100 dark:bg-primary-900 rounded-full h-10 w-10 flex items-center justify-center text-primary-600 dark:text-primary-300">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex justify-between overflow-x-auto scrollbar-hide">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Logout button in navigation */}
          <button
            onClick={handleLogout}
            className="whitespace-nowrap flex items-center py-4 px-1 border-b-2 border-transparent font-medium text-sm text-red-500 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300"
            aria-label={t('auth.logout')}
          >
            <span className="mr-2"><FaSignOutAlt /></span>
            {t('auth.logout')}
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage; 