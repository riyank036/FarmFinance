import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaSignOutAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';

const AdminProfile = () => {
  const { user, logout, updatePassword } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the updatePassword function from auth context
      const result = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setSuccess('Password updated successfully');
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Reset show password states
        setShowPasswords({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false
        });
        // Close the form after a delay
        setTimeout(() => {
          setIsChangingPassword(false);
        }, 2000);
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred while updating password');
      console.error('Password update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Profile & Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Profile Information</h2>
          
          <div className="flex items-start">
            <div className="mr-4">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.username} 
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-gray-700 flex items-center justify-center">
                  <FaUser className="h-10 w-10 text-primary-600 dark:text-gray-300" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FaUser className="inline mr-1" /> Name
                </label>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {user?.username || 'Admin User'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FaEnvelope className="inline mr-1" /> Email
                </label>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
          
          <div className="space-y-4">
            <button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
              onClick={() => setIsChangingPassword(true)}
            >
              <FaLock className="mr-2" /> Change Password
            </button>
            
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Password</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-200">
                {success}
              </div>
            )}
            
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    aria-label={showPasswords.currentPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.currentPassword ? (
                      <FaEyeSlash className={`dark:text-gray-400 text-gray-500 h-4 w-4`} />
                    ) : (
                      <FaEye className={`dark:text-gray-400 text-gray-500 h-4 w-4`} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    aria-label={showPasswords.newPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.newPassword ? (
                      <FaEyeSlash className={`dark:text-gray-400 text-gray-500 h-4 w-4`} />
                    ) : (
                      <FaEye className={`dark:text-gray-400 text-gray-500 h-4 w-4`} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer z-10"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    aria-label={showPasswords.confirmPassword ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirmPassword ? (
                      <FaEyeSlash className={`dark:text-gray-400 text-gray-500 h-4 w-4`} />
                    ) : (
                      <FaEye className={`dark:text-gray-400 text-gray-500 h-4 w-4`} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setError('');
                    setSuccess('');
                    // Reset show password states when closing
                    setShowPasswords({
                      currentPassword: false,
                      newPassword: false,
                      confirmPassword: false
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile; 