import { useState, useEffect } from 'react';
import axios from '../../../core/api/axiosConfig';
import { ADMIN_ENDPOINTS } from '../../../core/config/apiConfig';
import { 
  FaSpinner, 
  FaFilter, 
  FaCheck, 
  FaSync, 
  FaTrash, 
  FaExclamationTriangle,
  FaQuestion,
  FaCommentAlt,
  FaLifeRing,
  FaBug,
  FaChartPie,
  FaEye,
  FaCheckCircle,
  FaUsers,
  FaUserCircle,
  FaAngleDown,
  FaAngleUp,
  FaList
} from 'react-icons/fa';

const FeedbackManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byCategory: {}
  });
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showCategoryStats, setShowCategoryStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserStats, setShowUserStats] = useState(false);
  const [expandedUserDetails, setExpandedUserDetails] = useState({});
  const [activeUserTab, setActiveUserTab] = useState({});

  const fetchFeedbackData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch feedback stats
      const statsRes = await axios.get(ADMIN_ENDPOINTS.FEEDBACK_STATS);
      
      // Fetch all feedback
      const feedbackRes = await axios.get(ADMIN_ENDPOINTS.FEEDBACK);
      
      if (statsRes.data.success && feedbackRes.data.success) {
        setStats(statsRes.data.stats);
        setFeedback(feedbackRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      setError('Failed to load feedback data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`${ADMIN_ENDPOINTS.FEEDBACK}/${id}`, { status: newStatus });
      
      if (response.data.success) {
        // Update the feedback in the local state
        setFeedback(prevFeedback => 
          prevFeedback.map(item => 
            item._id === id ? { ...item, status: newStatus } : item
          )
        );
        
        // If the currently selected feedback is being updated, update it
        if (selectedFeedback && selectedFeedback._id === id) {
          setSelectedFeedback({ ...selectedFeedback, status: newStatus });
        }
        
        // Refetch stats
        const statsRes = await axios.get(ADMIN_ENDPOINTS.FEEDBACK_STATS);
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      }
    } catch (err) {
      console.error('Error updating feedback status:', err);
      setError('Failed to update feedback status. Please try again later.');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`${ADMIN_ENDPOINTS.FEEDBACK}/${id}`);
      
      if (response.data.success) {
        // Remove the feedback from the local state
        setFeedback(prevFeedback => prevFeedback.filter(item => item._id !== id));
        
        // If the currently selected feedback is being deleted, clear it
        if (selectedFeedback && selectedFeedback._id === id) {
          setSelectedFeedback(null);
        }
        
        // Refetch stats
        const statsRes = await axios.get(ADMIN_ENDPOINTS.FEEDBACK_STATS);
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError('Failed to delete feedback. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In Review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'New': return <FaExclamationTriangle className="text-blue-500" />;
      case 'In Review': return <FaEye className="text-yellow-500" />;
      case 'Resolved': return <FaCheckCircle className="text-green-500" />;
      default: return <FaQuestion className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Bug Report': return <FaBug className="text-red-500" />;
      case 'Support': return <FaLifeRing className="text-blue-500" />;
      case 'General Feedback': return <FaCommentAlt className="text-green-500" />;
      default: return <FaQuestion className="text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Bug Report': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Support': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'General Feedback': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get unique users from feedback
  const uniqueUsers = [...new Set(feedback
    .filter(item => item.user && item.user.username)
    .map(item => JSON.stringify({ id: item.user.id, username: item.user.username }))
  )].map(str => JSON.parse(str));

  // User stats data
  const getUserStats = () => {
    const userCounts = {};
    
    feedback.forEach(item => {
      if (item.user && item.user.id) {
        const userId = item.user.id;
        const username = item.user.username || 'Unknown';
        
        if (!userCounts[userId]) {
          userCounts[userId] = {
            id: userId,
            username,
            email: item.user.email || 'N/A',
            count: 0,
            categories: {},
            statuses: {}
          };
        }
        
        userCounts[userId].count++;
        
        // Count by category
        if (!userCounts[userId].categories[item.category]) {
          userCounts[userId].categories[item.category] = 0;
        }
        userCounts[userId].categories[item.category]++;
        
        // Count by status
        if (!userCounts[userId].statuses[item.status]) {
          userCounts[userId].statuses[item.status] = 0;
        }
        userCounts[userId].statuses[item.status]++;
      }
    });
    
    return Object.values(userCounts).sort((a, b) => b.count - a.count);
  };

  // Apply all filters
  const filteredFeedback = feedback.filter(item => {
    const statusMatch = filter === 'all' || item.status === filter;
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    const userMatch = userFilter === 'all' || (item.user && item.user.id === userFilter);
    return statusMatch && categoryMatch && userMatch;
  });

  // Remove any "Feature Request" items from the categories array
  const filteredCategories = [...new Set(feedback.map(item => item.category))].filter(
    category => category !== 'Feature Request'
  );

  // Toggle expanded user details
  const toggleUserExpand = (userId) => {
    setExpandedUserDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
    
    // Set default active tab if not set
    if (!activeUserTab[userId]) {
      setActiveUserTab(prev => ({
        ...prev,
        [userId]: 'all'
      }));
    }
  };

  // Set active tab for user
  const setUserActiveTab = (userId, tab) => {
    setActiveUserTab(prev => ({
      ...prev,
      [userId]: tab
    }));
  };

  // Get user feedback messages filtered by tab
  const getUserFeedbackMessages = (userId, tab = 'all') => {
    return feedback.filter(item => 
      item.user && 
      item.user.id === userId && 
      (tab === 'all' || item.status === tab)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback & Support Management</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUserStats(!showUserStats)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              showUserStats 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <FaUsers className="mr-2" />
            {showUserStats ? 'Hide User Stats' : 'Show User Stats'}
          </button>
          <button 
            onClick={fetchFeedbackData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400"
          >
            {refreshing ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSync className="mr-2" />
            )}
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* User Statistics */}
      {showUserStats && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
              <FaUsers className="mr-2 text-indigo-500" />
              User Feedback Analysis
            </h2>
          </div>
          
          {uniqueUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No user data available.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {uniqueUsers.map(user => {
                // Calculate user stats
                const userFeedback = feedback.filter(item => 
                  item.user && item.user.id === user.id
                );
                
                const statusCounts = {};
                const categoryCounts = {};
                
                userFeedback.forEach(item => {
                  statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
                  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                });
                
                const isExpanded = expandedUserDetails[user.id] || false;
                const userActiveTabValue = activeUserTab[user.id] || 'all';
                
                return (
                  <div key={user.id}>
                    <div 
                      className={`p-4 ${
                        userFilter === user.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      } transition-colors cursor-pointer`}
                      onClick={() => toggleUserExpand(user.id)}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                          <FaUserCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <div className="ml-3 flex-grow">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {userFeedback.length} feedback items
                            </span>
                            {Object.entries(statusCounts).map(([status, count]) => (
                              <span key={status} className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(status)}`}>
                                {status}: {count}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center ml-2 gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserFilter(userFilter === user.id ? 'all' : user.id);
                            }}
                            className={`px-2 py-1 text-xs rounded-md ${
                              userFilter === user.id
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {userFilter === user.id ? 'Clear Filter' : 'Filter'}
                          </button>
                          {isExpanded ? (
                            <FaAngleUp className="text-gray-500" />
                          ) : (
                            <FaAngleDown className="text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        {/* Tabs for status filter */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                          <button
                            className={`px-4 py-2 text-sm font-medium ${
                              userActiveTabValue === 'all'
                                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                            onClick={() => setUserActiveTab(user.id, 'all')}
                          >
                            All Messages ({userFeedback.length})
                          </button>
                          {Object.entries(statusCounts).map(([status, count]) => (
                            <button
                              key={status}
                              className={`px-4 py-2 text-sm font-medium ${
                                userActiveTabValue === status
                                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                              }`}
                              onClick={() => setUserActiveTab(user.id, status)}
                            >
                              {status} ({count})
                            </button>
                          ))}
                        </div>
                        
                        {/* User's feedback messages */}
                        <div className="space-y-3">
                          {getUserFeedbackMessages(user.id, userActiveTabValue).length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                              No feedback messages in this category.
                            </p>
                          ) : (
                            getUserFeedbackMessages(user.id, userActiveTabValue).map(item => (
                              <div 
                                key={item._id} 
                                className={`p-3 border rounded-lg ${
                                  selectedFeedback && selectedFeedback._id === item._id
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                } transition-colors cursor-pointer`}
                                onClick={() => setSelectedFeedback(item)}
                              >
                                <div className="flex justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                                      {getCategoryIcon(item.category)}
                                      <span className="ml-1">{item.category}</span>
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                      {getStatusIcon(item.status)}
                                      <span className="ml-1">{item.status}</span>
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(item.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.message}
                                </p>
                                <div className="flex justify-end mt-2">
                                  <button
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFeedback(item);
                                      document.getElementById('feedbackDetail').scrollIntoView({ behavior: 'smooth' });
                                    }}
                                  >
                                    View Details <FaAngleDown className="ml-1" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Stats Summary */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mr-3">
            {showCategoryStats ? 'Category Summary' : 'Status Summary'}
          </h2>
          <button 
            onClick={() => setShowCategoryStats(!showCategoryStats)}
            className="flex items-center text-primary-600 text-sm hover:text-primary-800 bg-primary-50 dark:bg-primary-900 dark:text-primary-300 px-3 py-1 rounded-full"
          >
            <FaChartPie className="mr-1" /> 
            {showCategoryStats ? 'Show Status Stats' : 'Show Category Stats'}
          </button>
        </div>
        
        {!showCategoryStats ? (
          // Status Stats
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Total Feedback</h2>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.total}</p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <FaExclamationTriangle className="text-blue-500 mr-2" />
                <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-200">New</h2>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.byStatus?.New || 0}</p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <FaEye className="text-yellow-500 mr-2" />
                <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-200">In Review</h2>
              </div>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.byStatus?.['In Review'] || 0}</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <FaCheckCircle className="text-green-500 mr-2" />
                <h2 className="text-lg font-semibold text-green-700 dark:text-green-200">Resolved</h2>
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.byStatus?.Resolved || 0}</p>
            </div>
          </div>
        ) : (
          // Category Stats
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory || {}).map(([category, count]) => (
              <div key={category} className={`rounded-lg p-4 shadow-sm ${
                category === 'Bug Report' ? 'bg-red-50 dark:bg-red-900' :
                category === 'Support' ? 'bg-blue-50 dark:bg-blue-900' :
                'bg-green-50 dark:bg-green-900'
              }`}>
                <div className="flex items-center mb-2">
                  {getCategoryIcon(category)}
                  <h2 className={`ml-2 text-lg font-semibold ${
                    category === 'Bug Report' ? 'text-red-700 dark:text-red-200' :
                    category === 'Support' ? 'text-blue-700 dark:text-blue-200' :
                    'text-green-700 dark:text-green-200'
                  }`}>{category}</h2>
                </div>
                <p className={`text-3xl font-bold ${
                  category === 'Bug Report' ? 'text-red-600 dark:text-red-400' :
                  category === 'Support' ? 'text-blue-600 dark:text-blue-400' :
                  'text-green-600 dark:text-green-400'
                }`}>{count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Filters</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="mb-2 font-medium flex items-center text-gray-700 dark:text-gray-200">
              <FaFilter className="mr-1" /> Status:
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ring-2 ring-primary-500' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Statuses
              </button>
              <button 
                onClick={() => setFilter('New')}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors ${
                  filter === 'New' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-500' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FaExclamationTriangle className="text-blue-500 mr-1" /> New
              </button>
              <button 
                onClick={() => setFilter('In Review')}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors ${
                  filter === 'In Review' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 ring-2 ring-yellow-500' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FaEye className="text-yellow-500 mr-1" /> In Review
              </button>
              <button 
                onClick={() => setFilter('Resolved')}
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors ${
                  filter === 'Resolved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ring-2 ring-green-500' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FaCheckCircle className="text-green-500 mr-1" /> Resolved
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-w-[250px]">
            <div className="mb-2 font-medium flex items-center text-gray-700 dark:text-gray-200">
              <FaFilter className="mr-1" /> Category:
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === 'all' 
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ring-2 ring-primary-500' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Categories
              </button>
              
              {filteredCategories.map(category => (
                <button 
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors ${
                    categoryFilter === category 
                      ? `${getCategoryColor(category)} ring-2 ${
                          category === 'Bug Report' ? 'ring-red-500' :
                          category === 'Support' ? 'ring-blue-500' :
                          'ring-green-500'
                        }`
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1">{category}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* User filter */}
          <div className="flex-1 min-w-[250px]">
            <div className="mb-2 font-medium flex items-center text-gray-700 dark:text-gray-200">
              <FaUserCircle className="mr-1" /> User:
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setUserFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  userFilter === 'all' 
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 ring-2 ring-primary-500' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Users
              </button>
              
              {uniqueUsers.slice(0, 5).map(user => (
                <button 
                  key={user.id}
                  onClick={() => setUserFilter(user.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors ${
                    userFilter === user.id 
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FaUserCircle className="mr-1" />
                  <span className="ml-1">{user.username}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results indicator */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 py-2 px-3 rounded-md inline-block">
          Showing {filteredFeedback.length} of {feedback.length} feedback items
          {userFilter !== 'all' && ` for selected user`}
        </div>
        
        {/* Clear filters button */}
        {(filter !== 'all' || categoryFilter !== 'all' || userFilter !== 'all') && (
          <button 
            onClick={() => {
              setFilter('all');
              setCategoryFilter('all');
              setUserFilter('all');
            }}
            className="ml-3 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      {/* Feedback List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="feedbackDetail">
        {/* Feedback List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-lg text-gray-900 dark:text-white">Feedback List</h2>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {filteredFeedback.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No feedback found matching the current filters.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFeedback.map(item => (
                  <li 
                    key={item._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedFeedback && selectedFeedback._id === item._id 
                        ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-primary-500' 
                        : ''
                    }`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white flex items-center">
                          {getCategoryIcon(item.category)}
                          <span className="ml-2">{item.user?.username || 'Anonymous'}</span>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(item.createdAt)}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">{item.status}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Feedback Detail */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {selectedFeedback ? (
            <div>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center">
                  {getCategoryIcon(selectedFeedback.category)}
                  <span className="ml-2">{selectedFeedback.category}</span>
                </h2>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFeedback.status)}`}>
                  {getStatusIcon(selectedFeedback.status)}
                  <span className="ml-1">{selectedFeedback.status}</span>
                </span>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap justify-between items-center mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From: <span className="font-medium text-gray-900 dark:text-white">{selectedFeedback.user?.username || 'Anonymous'}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email: <span className="font-medium text-gray-900 dark:text-white">{selectedFeedback.user?.email || 'N/A'}</span>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
                    Submitted: <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedFeedback.createdAt)}</span>
                  </p>
                </div>
                
                {/* Feedback message */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Message:</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Actions:</h3>
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedFeedback._id, 'New')}
                        disabled={selectedFeedback.status === 'New'}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                          selectedFeedback.status === 'New'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                        }`}
                      >
                        <FaExclamationTriangle className="mr-1.5" /> Mark as New
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedFeedback._id, 'In Review')}
                        disabled={selectedFeedback.status === 'In Review'}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                          selectedFeedback.status === 'In Review'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                        }`}
                      >
                        <FaEye className="mr-1.5" /> Mark In Review
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedFeedback._id, 'Resolved')}
                        disabled={selectedFeedback.status === 'Resolved'}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                          selectedFeedback.status === 'Resolved'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                        }`}
                      >
                        <FaCheckCircle className="mr-1.5" /> Mark as Resolved
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteFeedback(selectedFeedback._id)}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 flex items-center dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                    >
                      <FaTrash className="mr-1.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
              <FaCommentAlt className="text-4xl mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-lg">Select a feedback item to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement; 