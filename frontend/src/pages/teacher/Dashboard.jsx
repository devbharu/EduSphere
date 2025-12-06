/**
 * src/pages/teacher/Dashboard.jsx
 * Teacher Dashboard - Main dashboard for teachers.
 * Shows assessment performance analytics and includes actions for live class creation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWebRTCCall } from '../../context/WebRTCContext'; // <-- NEW IMPORT
import CreateLiveClassModal from '../../components/CreateLiveClassModal'; // <-- NEW IMPORT
import {
    BookOpen,
    Users,
    TrendingUp,
    Award,
    Plus,
    Eye,
    Calendar,
    Clock,
    Target,
    BarChart3,
    FileText,
    ArrowRight,
    Activity,
    CheckCircle,
    AlertCircle,
    LogOut,
    Video // For Live Class
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { user, logout } = useAuth();

    // Live Class Management from Context
    const { fetchLiveClasses } = useWebRTCCall(); // Call fetch on mount to sync global state

    const [assessments, setAssessments] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // <-- NEW STATE for Modal
    const [stats, setStats] = useState({
        totalAssessments: 0,
        totalAttempts: 0,
        averageScore: 0,
        activeStudents: 0
    });

    useEffect(() => {
        // Load assessment data and fetch active live classes
        loadDashboardData();
        fetchLiveClasses();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            // Load assessments
            const assessmentsRes = await fetch('http://localhost:5000/api/assessments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const assessmentsData = await assessmentsRes.json();
            const assessmentsList = assessmentsData.assessments || [];
            setAssessments(assessmentsList);

            // Load all results for all assessments
            const resultsPromises = assessmentsList.map(async (assessment) => {
                const res = await fetch(`http://localhost:5000/api/assessment-users/assessment/${assessment._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                return data.records || [];
            });

            const resultsArrays = await Promise.all(resultsPromises);
            const allResultsFlat = resultsArrays.flat();
            setAllResults(allResultsFlat);

            // Calculate stats
            const uniqueStudents = new Set(allResultsFlat.map(r => r.studentId?._id || r.studentId));
            const avgScore = allResultsFlat.length > 0
                ? Math.round(allResultsFlat.reduce((sum, r) => sum + r.marks, 0) / allResultsFlat.length)
                : 0;

            setStats({
                totalAssessments: assessmentsList.length,
                totalAttempts: allResultsFlat.length,
                averageScore: avgScore,
                activeStudents: uniqueStudents.size
            });

            setLoading(false);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setLoading(false);
        }
    };

    // Handler for successful class creation (navigates teacher to room)
    const handleClassCreationSuccess = (newClass) => {
        navigate(`/live-class/${newClass._id}`);
    };

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Call logout from AuthContext if available
        if (logout) {
            logout();
        }

        // Redirect to login page
        navigate('/login');
    };

    const getRecentAssessments = () => {
        return assessments.slice(0, 5);
    };

    const getTopPerformers = () => {
        const studentScores = {};

        allResults.forEach(result => {
            const studentId = result.studentId?._id || result.studentId;
            if (!studentScores[studentId]) {
                studentScores[studentId] = {
                    totalScore: 0,
                    count: 0,
                    studentId: studentId
                };
            }
            studentScores[studentId].totalScore += result.marks;
            studentScores[studentId].count += 1;
        });

        return Object.values(studentScores)
            .map(s => ({
                studentId: s.studentId,
                averageScore: Math.round(s.totalScore / s.count),
                assessmentsTaken: s.count
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 5);
    };

    const getAssessmentResults = (assessmentId) => {
        return allResults.filter(r => r.assesmentId === assessmentId || r.assesmentId?._id === assessmentId);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                }`}>
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className={`absolute inset-0 border-4 rounded-full ${theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                            }`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                            }`}></div>
                    </div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
            <ThemeToggle />

            {/* Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-lg shadow-sm border-b transition-colors duration-300 ${theme === 'dark'
                ? 'bg-gray-800/95 border-gray-700'
                : 'bg-white/80 border-gray-200'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                Welcome back, {user?.name || 'Teacher'}
                            </h1>
                            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                Here's what's happening with your assessments today
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsModalOpen(true)} // <-- OPEN LIVE CLASS MODAL
                                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <Video size={20} />
                                <span className="hidden sm:inline">Start Live Class</span>
                            </button>
                            <button
                                onClick={() => navigate('/assignments/upload')}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">Create Assessment</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${theme === 'dark'
                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    }`}
                                title="Logout"
                            >
                                <LogOut size={20} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Assessments */}
                    <div className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'
                                }`}>
                                <BookOpen size={24} className="text-blue-500" />
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme === 'dark'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-blue-500/10 text-blue-700'
                                }`}>
                                Total
                            </span>
                        </div>
                        <h3 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {stats.totalAssessments}
                        </h3>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Assessments Created
                        </p>
                    </div>

                    {/* Total Attempts */}
                    <div className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${theme === 'dark'
                        ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50'
                        : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-500/10'
                                }`}>
                                <Activity size={24} className="text-green-500" />
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme === 'dark'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-500/10 text-green-700'
                                }`}>
                                Active
                            </span>
                        </div>
                        <h3 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {stats.totalAttempts}
                        </h3>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Total Attempts
                        </p>
                    </div>

                    {/* Average Score */}
                    <div className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${theme === 'dark'
                        ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50'
                        : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
                                }`}>
                                <TrendingUp size={24} className="text-purple-500" />
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme === 'dark'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-purple-500/10 text-purple-700'
                                }`}>
                                Average
                            </span>
                        </div>
                        <h3 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {stats.averageScore}%
                        </h3>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Class Average
                        </p>
                    </div>

                    {/* Active Students */}
                    <div className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${theme === 'dark'
                        ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50'
                        : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-500/10'
                                }`}>
                                <Users size={24} className="text-orange-500" />
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${theme === 'dark'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-orange-500/10 text-orange-700'
                                }`}>
                                Unique
                            </span>
                        </div>
                        <h3 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {stats.activeStudents}
                        </h3>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Active Students
                        </p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Assessments - 2 columns */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-2xl shadow-lg border p-6 ${theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                            }`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                                        }`}>
                                        <FileText size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                    </div>
                                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        Recent Assessments
                                    </h2>
                                </div>
                                <button
                                    onClick={() => navigate('/assignments/upload')}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'dark'
                                        ? 'text-blue-400 hover:text-blue-300'
                                        : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                >
                                    View All
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {getRecentAssessments().length === 0 ? (
                                <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                    }`}>
                                    <BookOpen size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                        }`} />
                                    <p className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        No assessments created yet
                                    </p>
                                    <button
                                        onClick={() => navigate('/assignments/upload')}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                    >
                                        Create Your First Assessment
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {getRecentAssessments().map((assessment) => {
                                        const results = getAssessmentResults(assessment._id);
                                        const avgScore = results.length > 0
                                            ? Math.round(results.reduce((sum, r) => sum + r.marks, 0) / results.length)
                                            : 0;

                                        return (
                                            <div
                                                key={assessment._id}
                                                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${theme === 'dark'
                                                    ? 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => navigate('/assignments/upload')}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                            {assessment.heading}
                                                        </h3>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                                            }`}>
                                                            {assessment.topic}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="text-center">
                                                            <p className={`font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                                }`}>
                                                                {assessment.questions?.length || 0}
                                                            </p>
                                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                                }`}>
                                                                Questions
                                                            </p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                                }`}>
                                                                {results.length}
                                                            </p>
                                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                                }`}>
                                                                Attempts
                                                            </p>
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-lg ${avgScore >= 80
                                                            ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                                                            : avgScore >= 60
                                                                ? theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                                                                : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            <p className="text-xs font-medium">Avg: {avgScore}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Performers - 1 column */}
                    <div>
                        <div className={`rounded-2xl shadow-lg border p-6 ${theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                            }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                                    }`}>
                                    <Award size={20} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} />
                                </div>
                                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    Top Performers
                                </h2>
                            </div>

                            {getTopPerformers().length === 0 ? (
                                <div className={`text-center py-12 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                    }`}>
                                    <Users size={48} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                        }`} />
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        No student attempts yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {getTopPerformers().map((student, index) => (
                                        <div
                                            key={student.studentId}
                                            className={`p-4 rounded-xl border ${theme === 'dark'
                                                ? 'bg-gray-700/30 border-gray-600'
                                                : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0
                                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                                                    : index === 1
                                                        ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
                                                        : index === 2
                                                            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                                            : theme === 'dark'
                                                                ? 'bg-gray-600 text-gray-300'
                                                                : 'bg-gray-200 text-gray-700'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                        Student {student.studentId.slice(-6)}
                                                    </p>
                                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                        }`}>
                                                        {student.assessmentsTaken} assessments
                                                    </p>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg font-bold ${student.averageScore >= 80
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : student.averageScore >= 60
                                                        ? 'bg-yellow-500/20 text-yellow-500'
                                                        : 'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {student.averageScore}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* NEW: Start Live Class Quick Action */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg ${theme === 'dark'
                            ? 'bg-gradient-to-br from-teal-900/50 to-green-900/50 border-teal-700/50 hover:border-teal-500'
                            : 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-200 hover:border-teal-500'
                            }`}
                    >
                        <div className={`inline-flex p-3 rounded-xl mb-4 ${theme === 'dark' ? 'bg-teal-500/20' : 'bg-teal-100'
                            }`}>
                            <Video size={24} className={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'} />
                        </div>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            Start Live Class
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Host a real-time video session now.
                        </p>
                    </button>

                    {/* Create Assessment */}
                    <button
                        onClick={() => navigate('/assignments/upload')}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg ${theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500'
                            : 'bg-white border-gray-200 hover:border-blue-500'
                            }`}
                    >
                        <div className={`inline-flex p-3 rounded-xl mb-4 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                            }`}>
                            <Plus size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        </div>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            Create Assessment
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Build a new assessment for your students
                        </p>
                    </button>

                    {/* View Results */}
                    <button
                        onClick={() => navigate('/assignments/upload')}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg ${theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 hover:border-green-500'
                            : 'bg-white border-gray-200 hover:border-green-500'
                            }`}
                    >
                        <div className={`inline-flex p-3 rounded-xl mb-4 ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                            }`}>
                            <Eye size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                        </div>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            View Results
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            Check student performance and scores
                        </p>
                    </button>

                    {/* Analytics */}
                    <button
                        onClick={() => navigate('/assignments/upload')}
                        className={`p-6 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg ${theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                            : 'bg-white border-gray-200 hover:border-purple-500'
                            }`}
                    >
                        <div className={`inline-flex p-3 rounded-xl mb-4 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                            }`}>
                            <BarChart3 size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                        </div>
                        <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                            Analytics
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            View detailed performance analytics
                        </p>
                    </button>
                </div>
            </div>

            {/* Live Class Creation Modal - RENDERED HERE */}
            <CreateLiveClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateSuccess={handleClassCreationSuccess}
            />
        </div>
    );
};

export default TeacherDashboard;