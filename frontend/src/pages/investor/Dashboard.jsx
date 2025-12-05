import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

const InvestorDashboard = () => {
  const [startups, setStartups] = useState([]);
  const [investedStartups, setInvestedStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch all startups
      const allStartupsRes = await axios.get('/api/startUp', config);
      setStartups(allStartupsRes.data || []);

      // Fetch startups where current user is an investor
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      const invested = (allStartupsRes.data || []).filter(startup =>
        startup.investors?.some(inv => inv._id === userId || inv.id === userId)
      );
      setInvestedStartups(invested);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/investor/startUp/${id}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const displayStartups = activeTab === 'all' ? startups : investedStartups;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
              <p className="text-gray-600 mt-2">Discover and manage startup investments</p>
            </div>
            
            {/* User Profile & Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={24} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Investor'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'Investor'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Investor
                      </span>
                    </div>
                    
                    <button
                      onClick={() => navigate('/investor/profile')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User size={16} />
                      My Profile
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200 mt-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Startups</p>
                <p className="text-3xl font-bold text-gray-900">{startups.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Investments</p>
                <p className="text-3xl font-bold text-green-600">{investedStartups.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Startups</p>
                <p className="text-3xl font-bold text-purple-600">{startups.length - investedStartups.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Startups ({startups.length})
              </button>
              <button
                onClick={() => setActiveTab('invested')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'invested'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Investments ({investedStartups.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Startups Grid */}
        {displayStartups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No startups found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'invested' ? 'You haven\'t invested in any startups yet.' : 'No startups available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStartups.map((startup) => (
              <div key={startup.id || startup._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{startup.name}</h3>
                    {investedStartups.some(s => (s.id || s._id) === (startup.id || startup._id)) && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Invested</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {startup.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {startup.investors?.length || 0} investors
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(startup.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(startup.id || startup._id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;