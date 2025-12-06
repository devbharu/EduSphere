import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardCheck,
    Clock,
    CheckCircle,
    Award,
    Search,
    BookOpen,
    Target,
    PlayCircle,
    AlertCircle,
    TrendingUp,
    Plus
} from 'lucide-react';

const Assessments = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user?._id) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');

            // Load both assessments and user results in parallel
            await Promise.all([
                loadAssessments(),
                loadUserResults()
            ]);

            setLoading(false);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load assessments. Please try again.');
            setLoading(false);
        }
    };

    const loadAssessments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/assessments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch assessments');
            }

            const data = await response.json();
            
            // Handle different response formats
            if (Array.isArray(data)) {
                setAssessments(data);
            } else if (data.assessments && Array.isArray(data.assessments)) {
                setAssessments(data.assessments);
            } else {
                setAssessments([]);
            }
        } catch (error) {
            console.error('Failed to load assessments:', error);
            throw error;
        }
    };

    const loadUserResults = async () => {
        try {
            if (!user?._id) {
                console.warn('User ID not available');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/assessment-users/user/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user results');
            }

            const data = await response.json();
            
            // Handle different response formats
            if (data.success && Array.isArray(data.records)) {
                setUserResults(data.records);
            } else if (Array.isArray(data)) {
                setUserResults(data);
            } else {
                setUserResults([]);
            }
        } catch (error) {
            console.error('Failed to load user results:', error);
            // Don't throw - user might not have attempted any assessments yet
            setUserResults([]);
        }
    };

    const handleStartAssessment = (assessmentId) => {
        // Navigate to quiz page with assessment ID
        navigate(`/assessment/${assessmentId}`);
    };

    const getUserResult = (assessmentId) => {
        return userResults.find(r => 
            r.assesmentId === assessmentId || 
            r.assesmentId?._id === assessmentId
        );
    };

    const filteredAssessments = assessments.filter(assessment =>
        assessment.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: assessments.length,
        completed: userResults.length,
        pending: assessments.length - userResults.length,
        avgScore: userResults.length > 0
            ? Math.round(userResults.reduce((sum, r) => sum + r.marks, 0) / userResults.length)
            : 0
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className={`absolute inset-0 border-4 rounded-full ${
                            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                        }`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
                            theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                        }`}></div>
                    </div>
                    <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading assessments...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-16 rounded-2xl border ${
                theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-white border-gray-200'
            }`}>
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${
                    theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                    <AlertCircle size={40} className="text-red-500" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                    Failed to Load Assessments
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {error}
                </p>
                <button
                    onClick={loadData}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className={`p-4 rounded-xl border transition-all duration-200 ${
                    theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                            <BookOpen size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>Total</p>
                            <p className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border transition-all duration-200 ${
                    theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                        }`}>
                            <Clock size={18} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} />
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>Pending</p>
                            <p className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border transition-all duration-200 ${
                    theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                        }`}>
                            <CheckCircle size={18} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>Completed</p>
                            <p className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border transition-all duration-200 ${
                    theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                        }`}>
                            <TrendingUp size={18} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <div>
                            <p className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>Avg Score</p>
                            <p className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{stats.avgScore}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} size={18} />
                    <input
                        type="text"
                        placeholder="Search assessments by title or topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                        }`}
                    />
                </div>
            </div>

            {/* Assessments List */}
            {filteredAssessments.length === 0 ? (
                <div className={`text-center py-16 rounded-2xl border ${
                    theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-white border-gray-200'
                }`}>
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                        <ClipboardCheck size={40} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        No Assessments Found
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {searchQuery ? 'Try adjusting your search' : 'Check back later for new assessments'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAssessments.map((assessment) => {
                        const userResult = getUserResult(assessment._id);
                        const isCompleted = !!userResult;

                        return (
                            <div
                                key={assessment._id}
                                className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${
                                    theme === 'dark'
                                        ? 'bg-gray-800/50 border-gray-700'
                                        : 'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${
                                                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                                            }`}>
                                                <ClipboardCheck size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-bold mb-1 ${
                                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {assessment.heading}
                                                </h3>
                                                <p className={`text-sm font-semibold ${
                                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                }`}>
                                                    {assessment.topic}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {isCompleted ? (
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                            theme === 'dark'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-green-50 text-green-700 border border-green-200'
                                        }`}>
                                            <Award size={14} className="mr-1.5" />
                                            {userResult.marks}%
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                            theme === 'dark'
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                        }`}>
                                            <Clock size={14} className="mr-1.5" />
                                            Not Taken
                                        </span>
                                    )}
                                </div>

                                <div className={`flex items-center gap-2 text-sm mb-5 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    <Target size={16} />
                                    <span>{assessment.questions?.length || 0} Questions</span>
                                </div>

                                <div className={`flex items-center justify-between pt-4 border-t ${
                                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    {isCompleted ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={18} className="text-green-500" />
                                            <span className={`text-sm font-medium ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                Completed
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex-1" />
                                    )}
                                    
                                    <button
                                        onClick={() => handleStartAssessment(assessment._id)}
                                        disabled={isCompleted}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md transition-all duration-200 ${
                                            isCompleted
                                                ? theme === 'dark'
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : theme === 'dark'
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg'
                                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg'
                                        }`}
                                    >
                                        <PlayCircle size={16} />
                                        <span>{isCompleted ? 'Completed' : 'Start Test'}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Assessments;