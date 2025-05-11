import { useState, useEffect } from 'react';
import axios from '../../../core/api/axiosConfig';
import { FaSearch, FaSpinner, FaUserCircle, FaTrash, FaEye } from 'react-icons/fa';
import { ADMIN_ENDPOINTS } from '../../../core/config/apiConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userFinancialData, setUserFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfitLoss: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(ADMIN_ENDPOINTS.USERS);
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError('Failed to load users data');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error loading users. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${ADMIN_ENDPOINTS.USERS}/${userId}`);
      
      if (response.data.success) {
        setSelectedUser(response.data.user);
        
        // Calculate financial summary
        const { expenses, income } = response.data.finances;
        const totalIncome = income.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        
        setUserFinancialData({
          totalIncome,
          totalExpenses,
          netProfitLoss: totalIncome - totalExpenses
        });
        
        setShowUserModal(true);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await axios.delete(`${ADMIN_ENDPOINTS.USERS}/${userToDelete._id}`);
      
      if (response.data.success) {
        // Remove user from the list
        setUsers(users.filter(user => user._id !== userToDelete._id));
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  // Filter users based on search term and location filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === '' || 
      (user.location && 
        (user.location.village.toLowerCase().includes(locationFilter.toLowerCase()) || 
         user.location.district.toLowerCase().includes(locationFilter.toLowerCase()) || 
         user.location.state.toLowerCase().includes(locationFilter.toLowerCase())));
    
    return matchesSearch && matchesLocation;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Filter by location (village, district, state)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500 dark:text-gray-400">{user.phoneNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500 dark:text-gray-400">
                      {user.location ? (
                        <>
                          {user.location.village && <span>{user.location.village}, </span>}
                          {user.location.district && <span>{user.location.district}, </span>}
                          {user.location.state && <span>{user.location.state}</span>}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      onClick={() => fetchUserDetails(user._id)}
                    >
                      <FaEye className="inline mr-1" /> View Details
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No users found matching the search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowUserModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Profile */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Profile</h3>
                
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    {selectedUser.profilePicture ? (
                      <img 
                        src={selectedUser.profilePicture} 
                        alt={selectedUser.username} 
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedUser.username}</p>
                    <p className="text-gray-600 dark:text-gray-300">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Phone: </span>
                    <span className="text-gray-600 dark:text-gray-400">{selectedUser.phoneNumber || 'N/A'}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {selectedUser.location ? (
                        <>
                          {selectedUser.location.village && <span>{selectedUser.location.village}, </span>}
                          {selectedUser.location.district && <span>{selectedUser.location.district}, </span>}
                          {selectedUser.location.state && <span>{selectedUser.location.state}</span>}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Joined: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Financial Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Summary</h3>
                
                <div className="space-y-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(userFinancialData.totalIncome)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(userFinancialData.totalExpenses)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-md shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit/Loss</p>
                    <p className={`text-xl font-bold ${
                      userFinancialData.netProfitLoss >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(userFinancialData.netProfitLoss)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Confirm Deletion</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the user <span className="font-semibold">{userToDelete.username}</span>? 
              This action cannot be undone and will delete all associated financial data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 