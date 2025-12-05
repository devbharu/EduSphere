import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Rocket, FileText, User, Mail, Briefcase, Save, X, CheckCircle, AlertCircle, Info, Edit, Calendar, Building2 } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const StartUpFundRiser = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [existingStartup, setExistingStartup] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ownerName: '',
    ownerEmail: ''
  });

  useEffect(() => {
    // Check if user exists in localStorage
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (!token || !userString) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userString);
      const userIdFromStorage = user._id || user.id;
      
      if (!userIdFromStorage) {
        navigate('/login');
        return;
      }
      
      setUserId(userIdFromStorage);
      loadStartup(token, userIdFromStorage);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const loadStartup = async (token, uid) => {
    try {
      const response = await axios.get('http://localhost:5000/api/startUp/my-startup', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.data) {
        // User has an existing startup
        setExistingStartup(response.data.data);
        setFormData({
          name: response.data.data.name || '',
          description: response.data.data.description || '',
          ownerName: response.data.data.ownerName || '',
          ownerEmail: response.data.data.ownerEmail || ''
        });
        setIsEditing(false); // Start in view mode
      } else {
        // No startup found, show form to create one
        setExistingStartup(null);
        setIsEditing(true); // Start in edit mode for new startup
      }
    } catch (error) {
      console.error('Error loading startup:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      // If it's just a 404 or no startup found, keep the form visible
      setExistingStartup(null);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    if (existingStartup) {
      // Reset to original data
      setFormData({
        name: existingStartup.name || '',
        description: existingStartup.description || '',
        ownerName: existingStartup.ownerName || '',
        ownerEmail: existingStartup.ownerEmail || ''
      });
      setIsEditing(false);
    } else {
      // If no existing startup, go back to dashboard
      navigate('/dashboard');
    }
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let response;
      
      if (existingStartup) {
        // Update existing startup
        response = await axios.put(
          `http://localhost:5000/api/startUp/${existingStartup._id}`, 
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new startup
        response = await axios.post(
          'http://localhost:5000/api/startUp', 
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Startup ${existingStartup ? 'updated' : 'created'} successfully!`
        });
        
        if (existingStartup) {
          // Update mode - reload data and switch to view mode
          setExistingStartup(response.data.data);
          setIsEditing(false);
          setSubmitting(false);
        } else {
          // Create mode - redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting startup:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred while saving your startup'
      });
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
              borderTopColor: 'transparent'
            }}
          ></div>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Loading your startup...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'
    }`}>
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-lg shadow-sm border-b transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800/95 border-gray-700'
          : 'bg-white/80 border-gray-200/60'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-100 hover:shadow-sm'
                }`}
                aria-label="Back to Dashboard"
              >
                <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {existingStartup && !isEditing ? 'Your Startup' : existingStartup ? 'Update Your Startup' : 'Register Your Startup'}
                </h1>
                <p className={`text-sm mt-0.5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {existingStartup && !isEditing
                    ? 'View your startup details'
                    : existingStartup
                      ? 'Keep your startup information up to date'
                      : 'Join our ecosystem and get funding opportunities'}
                </p>
              </div>
            </div>
            {existingStartup && !isEditing && (
              <button
                onClick={handleEdit}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                <Edit size={18} />
                <span>Edit Startup</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 border-l-4 px-5 py-4 rounded-xl shadow-sm animate-fade-in ${
            message.type === 'success'
              ? theme === 'dark'
                ? 'bg-green-900/20 border-green-500 text-green-400'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800'
              : theme === 'dark'
                ? 'bg-red-900/20 border-red-500 text-red-400'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Startup Card */}
        <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 hover:shadow-2xl ${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-100'
        }`}>
          {/* Header with Gradient */}
          <div className={`relative h-40 sm:h-48 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600'
              : 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700'
          }`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          </div>

          <div className="px-6 sm:px-8 lg:px-10 pb-8 sm:pb-10">
            <div className="flex flex-col items-center -mt-20 sm:-mt-24">
              {/* Icon */}
              <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 shadow-2xl flex items-center justify-center transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-700'
                  : 'bg-gradient-to-br from-white to-gray-50 border-white'
              }`}>
                <Rocket size={56} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
              </div>

              {/* Title */}
              <h2 className={`mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-center ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {existingStartup ? formData.name || 'Your Startup' : 'New Startup'}
              </h2>
              <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${
                theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {existingStartup ? '📊 Registered Startup' : '🚀 New Registration'}
              </div>
            </div>

            {/* View Mode - Display Data */}
            {existingStartup && !isEditing ? (
              <div className="mt-10 space-y-6">
                {/* Startup Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Startup Name */}
                  <div className={`p-5 rounded-xl border-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600'
                      : 'bg-blue-50 border-blue-100'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <Building2 size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                      </div>
                      <span className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Startup Name
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formData.name}
                    </p>
                  </div>

                  {/* Owner Name */}
                  <div className={`p-5 rounded-xl border-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600'
                      : 'bg-green-50 border-green-100'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                      }`}>
                        <User size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                      </div>
                      <span className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Owner Name
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formData.ownerName}
                    </p>
                  </div>

                  {/* Owner Email */}
                  <div className={`md:col-span-2 p-5 rounded-xl border-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700/30 border-gray-600'
                      : 'bg-indigo-50 border-indigo-100'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
                      }`}>
                        <Mail size={20} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
                      </div>
                      <span className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Owner Email
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formData.ownerEmail}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className={`p-5 rounded-xl border-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700/30 border-gray-600'
                    : 'bg-purple-50 border-purple-100'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <FileText size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <span className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Description
                    </span>
                  </div>
                  <p className={`text-base leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {formData.description || 'No description provided'}
                  </p>
                </div>

                {/* Timestamps */}
                {existingStartup.createdAt && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700/20 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`text-xs font-semibold ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Created On
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {formatDate(existingStartup.createdAt)}
                      </p>
                    </div>
                    {existingStartup.updatedAt && (
                      <div className={`p-4 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700/20 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                          <span className={`text-xs font-semibold ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Last Updated
                          </span>
                        </div>
                        <p className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {formatDate(existingStartup.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Edit Mode - Form */
              <form onSubmit={handleSubmit} className="mt-10 space-y-6 sm:space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Startup Name */}
                  <div className="md:col-span-2 group">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className={`p-1.5 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                      }`}>
                        <Briefcase size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                      </div>
                      Startup Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your startup name"
                      className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                      }`}
                    />
                  </div>

                  {/* Owner Name */}
                  <div className="group">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className={`p-1.5 rounded-lg ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50'
                      }`}>
                        <User size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                      </div>
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                      }`}
                    />
                  </div>

                  {/* Owner Email */}
                  <div className="group">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <div className={`p-1.5 rounded-lg ${
                        theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'
                      }`}>
                        <Mail size={16} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
                      </div>
                      Owner Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="ownerEmail"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="group">
                  <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <div className={`p-1.5 rounded-lg ${
                      theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'
                    }`}>
                      <FileText size={16} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe your startup, its mission, and what makes it unique..."
                    className={`w-full px-4 py-3.5 border-2 rounded-xl resize-none transition-all duration-200 placeholder:text-gray-400 ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                    }`}
                  />
                  <p className={`mt-2 text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {formData.description?.length || 0} characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium min-w-[160px] ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{existingStartup ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>{existingStartup ? 'Update Startup' : 'Create Startup'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className={`mt-8 p-5 border rounded-xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/30'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Info size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            Important Information
          </h3>
          <ul className={`space-y-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>
            <li className="flex items-start gap-2">
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>{existingStartup && !isEditing
                ? 'Click "Edit Startup" button to update your information.'
                : existingStartup
                  ? 'You can update your startup information. Click "Cancel" to discard changes.'
                  : 'Once you register your startup, you will be redirected to the dashboard.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>You can only register one startup per account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>Your contact information will be used to reach out regarding funding opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
              <span>Make your description compelling to attract potential investors</span>
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StartUpFundRiser;