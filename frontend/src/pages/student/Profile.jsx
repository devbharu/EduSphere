/**
 * Student Profile Page
 * View and edit student profile information
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Award,
    Edit2,
    Save,
    X,
    ArrowLeft,
    Building2,
    Hash,
    Sparkles,
    TrendingUp,
    Loader,Shield
} from 'lucide-react';
import authService from '../../services/authService';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth || '',
        address: user?.address || '',
        bio: user?.bio || '',
    });

    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [recommendationError, setRecommendationError] = useState('');

    const handleChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await authService.updateProfile(profileData);
            updateUser(result.user);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setProfileData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            dateOfBirth: user?.dateOfBirth || '',
            address: user?.address || '',
            bio: user?.bio || '',
        });
        setIsEditing(false);
        setError('');
        setSuccess('');
    };

    const handleGetRecommendations = async () => {
        setLoadingRecommendations(true);
        setRecommendationError('');
        
        try {
            // Step 1: Fetch assessments from Node.js backend
            console.log('Fetching assessment data...');
            const assessmentResponse = await fetch(
                `http://localhost:5000/api/assessment-users/raw/${user._id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!assessmentResponse.ok) {
                const errorData = await assessmentResponse.json();
                throw new Error(errorData.error || 'Failed to fetch assessments');
            }

            const assessmentData = await assessmentResponse.json();
            console.log('Assessment data fetched:', assessmentData);

            if (!assessmentData.success || !assessmentData.assessments) {
                throw new Error('Invalid assessment data received');
            }

            // Step 2: Send to Python AI service
            console.log('Sending data to AI service...');
            const aiResponse = await fetch('http://localhost:8000/ai/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    assessments: assessmentData.assessments,
                    student_name: user.name || 'Student'
                })
            });

            if (!aiResponse.ok) {
                const errorData = await aiResponse.json();
                throw new Error(errorData.error || 'Failed to generate recommendations');
            }

            const aiData = await aiResponse.json();
            console.log('AI recommendations received:', aiData);

            if (!aiData.success) {
                throw new Error('Failed to generate recommendations');
            }

            setRecommendations(aiData);
            setShowRecommendations(true);
            
        } catch (err) {
            console.error('Failed to get AI recommendations:', err);
            setRecommendationError(err.message || 'Failed to get recommendations. Please try again.');
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const RecommendationsModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${
                theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
            }`}>
                {/* Header */}
                <div className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-lg ${
                    theme === 'dark'
                        ? 'bg-gray-800/95 border-gray-700'
                        : 'bg-white/95 border-gray-200'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                            }`}>
                                <Sparkles size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    AI Study Recommendations
                                </h3>
                                <p className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Personalized insights for {recommendations?.student_name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRecommendations(false)}
                            className={`p-2 rounded-xl transition-all duration-200 ${
                                theme === 'dark'
                                    ? 'hover:bg-gray-700 text-gray-400'
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-xl border ${
                            theme === 'dark'
                                ? 'bg-blue-500/10 border-blue-500/30'
                                : 'bg-blue-50 border-blue-200'
                        }`}>
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                            }`}>
                                Total Assessments
                            </p>
                            <p className={`text-2xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {recommendations?.total_assessments || 0}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${
                            theme === 'dark'
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-green-50 border-green-200'
                        }`}>
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-green-400' : 'text-green-700'
                            }`}>
                                Average Score
                            </p>
                            <p className={`text-2xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {recommendations?.average_score || 0}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${
                            theme === 'dark'
                                ? 'bg-purple-500/10 border-purple-500/30'
                                : 'bg-purple-50 border-purple-200'
                        }`}>
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                            }`}>
                                Highest Score
                            </p>
                            <p className={`text-2xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {recommendations?.summary?.highest_score || 0}%
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${
                            theme === 'dark'
                                ? 'bg-orange-500/10 border-orange-500/30'
                                : 'bg-orange-50 border-orange-200'
                        }`}>
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
                            }`}>
                                Lowest Score
                            </p>
                            <p className={`text-2xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {recommendations?.summary?.lowest_score || 0}%
                            </p>
                        </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className={`p-6 rounded-xl border ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30'
                            : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                    }`}>
                        <div className={`prose prose-sm max-w-none ${
                            theme === 'dark' ? 'prose-invert' : ''
                        }`}>
                            <div className={`whitespace-pre-wrap leading-relaxed ${
                                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                                {recommendations?.recommendations || 'No recommendations available.'}
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowRecommendations(false)}
                            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
                                    My Profile
                                </h1>
                                <p className={`text-sm mt-0.5 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    Manage your personal information
                                </p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium ${
                                    theme === 'dark'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                }`}
                            >
                                <Edit2 size={18} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={handleCancel}
                                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 font-medium ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                    }`}
                                >
                                    <X size={18} />
                                    <span className="hidden sm:inline">Cancel</span>
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium min-w-[120px] ${
                                        theme === 'dark'
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>Save</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Success/Error Messages */}
                {success && (
                    <div className={`mb-6 border-l-4 px-5 py-4 rounded-xl shadow-sm animate-fade-in ${
                        theme === 'dark'
                            ? 'bg-green-900/20 border-green-500 text-green-400'
                            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800'
                    }`}>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} />
                            <p className="font-medium">{success}</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className={`mb-6 border-l-4 px-5 py-4 rounded-xl shadow-sm animate-fade-in ${
                        theme === 'dark'
                            ? 'bg-red-900/20 border-red-500 text-red-400'
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800'
                    }`}>
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Profile Card */}
                <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-white border-gray-100'
                }`}>
                    {/* Profile Header with Gradient */}
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
                            {/* Avatar */}
                            <div className="relative group">
                                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-3xl ${
                                    theme === 'dark'
                                        ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-700'
                                        : 'bg-gradient-to-br from-white to-gray-50 border-white'
                                }`}>
                                    <User size={56} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                </div>
                                {isEditing && (
                                    <button 
                                        className={`absolute bottom-2 right-2 p-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                                            theme === 'dark'
                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                        aria-label="Change profile picture"
                                    >
                                        <Camera size={18} className="text-white cursor-pointer" />
                                    </button>
                                )}
                            </div>
                            
                            {/* Name & Role */}
                            <h2 className={`mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-center ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {profileData.name || 'Your Name'}
                            </h2>
                            <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border ${
                                theme === 'dark'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                                {user?.role === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="mt-10 space-y-6 sm:space-y-7">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div className="group">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        <div className={`p-1.5 rounded-lg ${
                                            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                                        }`}>
                                            <User size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                        </div>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter your full name"
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:text-gray-500'
                                                : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-50 disabled:text-gray-600'
                                        }`}
                                    />
                                </div>

                                {/* Email Address */}
                                <div className="group">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        <div className={`p-1.5 rounded-lg ${
                                            theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-50'
                                        }`}>
                                            <Mail size={16} className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} />
                                        </div>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="your.email@example.com"
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:text-gray-500'
                                                : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-50 disabled:text-gray-600'
                                        }`}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="group">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        <div className={`p-1.5 rounded-lg ${
                                            theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50'
                                        }`}>
                                            <Phone size={16} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                                        </div>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="+1 (555) 000-0000"
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:text-gray-500'
                                                : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-50 disabled:text-gray-600'
                                        }`}
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div className="group">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        <div className={`p-1.5 rounded-lg ${
                                            theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'
                                        }`}>
                                            <Calendar size={16} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                        </div>
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={profileData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:text-gray-500'
                                                : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-50 disabled:text-gray-600'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Address - Full Width */}
                            <div className="group">
                                <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <div className={`p-1.5 rounded-lg ${
                                        theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-50'
                                    }`}>
                                        <MapPin size={16} className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} />
                                    </div>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={profileData.address}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Street address, city, state, ZIP code"
                                    className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 placeholder:text-gray-400 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:text-gray-500'
                                            : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-50 disabled:text-gray-600'
                                    }`}
                                />
                            </div>

                            {/* Bio - Full Width */}
                            <div className="group">
                                <label className={`flex items-center gap-2 text-sm font-semibold mb-2.5 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <div className={`p-1.5 rounded-lg ${
                                        theme === 'dark' ? 'bg-pink-500/20' : 'bg-pink-50'
                                    }`}>
                                        <Edit2 size={16} className={theme === 'dark' ? 'text-pink-400' : 'text-pink-600'} />
                                    </div>
                                    About Me
                                </label>
                                <textarea
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows="5"
                                    placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                                    className={`w-full px-4 py-3.5 border-2 rounded-xl resize-none transition-all duration-200 placeholder:text-gray-400 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-800 disabled:text-gray-500'
                                            : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-50 disabled:text-gray-600'
                                    }`}
                                />
                                <p className={`mt-2 text-xs ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    {profileData.bio?.length || 0} characters
                                </p>
                            </div>
                        </div>

                        {/* Additional Info Card */}
                        <div className={`mt-8 p-5 border rounded-xl ${
                            theme === 'dark'
                                ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/30'
                                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                        }`}>
                            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                <Shield size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                Profile Tips
                            </h3>
                            <ul className={`space-y-2 text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                                <li className="flex items-start gap-2">
                                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
                                    <span>Keep your profile information up to date for better communication</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
                                    <span>A complete profile helps teachers and peers connect with you</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>•</span>
                                    <span>Your email is used for important notifications and updates</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations Section */}
                <div className={`p-6 border rounded-xl ${
                    theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl ${
                                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                            }`}>
                                <Sparkles size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-bold mb-1 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Get AI Study Recommendations
                                </h3>
                                <p className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                                }`}>
                                    Receive personalized study insights based on your assessment performance
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleGetRecommendations}
                            disabled={loadingRecommendations}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-all duration-200 font-medium whitespace-nowrap ${
                                loadingRecommendations
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:shadow-xl hover:scale-105'
                            } ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                            }`}
                        >
                            {loadingRecommendations ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>Analyzing...</span>
                                </>
                            ) : (
                                <>
                                    <TrendingUp size={20} />
                                    <span>Get Recommendations</span>
                                </>
                            )}
                        </button>
                    </div>
                    {recommendationError && (
                        <div className={`mt-4 p-3 rounded-lg border-l-4 ${
                            theme === 'dark'
                                ? 'bg-red-900/20 border-red-500 text-red-400'
                                : 'bg-red-50 border-red-500 text-red-700'
                        }`}>
                            <p className="text-sm font-medium">{recommendationError}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendations Modal */}
            {showRecommendations && recommendations && <RecommendationsModal />}

            {/* Add fade-in animation */}
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

export default Profile;