/**
 * Student Dashboard - Main dashboard for students
 * Shows upcoming classes, deadlines, performance, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    BookOpen,
    Calendar,
    Clock,
    TrendingUp,
    Video,
    FileText,
    MessageSquare,
    HelpCircle,
    Bell,
    LogOut,
    User,
    ChevronRight,
    Award,
    Target,
    Sparkles,
    Menu,
    X
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        upcomingClasses: [],
        recentAssignments: [],
        stats: {
            completedAssignments: 0,
            pendingAssignments: 0,
            averageGrade: 0,
            attendance: 0,
        },
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // TODO: Replace with actual API calls
            // Simulating API call with dummy data
            setTimeout(() => {
                setDashboardData({
                    upcomingClasses: [
                        { id: 1, name: 'Mathematics', time: '10:00 AM', date: 'Today', teacher: 'Mr. Johnson' },
                        { id: 2, name: 'Physics', time: '2:00 PM', date: 'Today', teacher: 'Dr. Smith' },
                        { id: 3, name: 'Chemistry', time: '11:00 AM', date: 'Tomorrow', teacher: 'Ms. Davis' },
                    ],
                    recentAssignments: [
                        { id: 1, title: 'Calculus Problem Set', subject: 'Mathematics', due: '2 days', status: 'pending' },
                        { id: 2, title: 'Lab Report', subject: 'Physics', due: '5 days', status: 'pending' },
                        { id: 3, title: 'Essay on Organic Chemistry', subject: 'Chemistry', due: 'Submitted', status: 'submitted' },
                    ],
                    stats: {
                        completedAssignments: 12,
                        pendingAssignments: 3,
                        averageGrade: 85,
                        attendance: 92,
                    },
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className={`absolute inset-0 border-4 ${
                            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                        } rounded-full`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent ${
                            theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                        } rounded-full animate-spin`}></div>
                    </div>
                    <p className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Top Navigation Bar */}
            <nav className={`sticky top-0 z-40 ${
                theme === 'dark' 
                    ? 'bg-gray-800/95 border-gray-700' 
                    : 'bg-white/95 border-gray-200'
            } backdrop-blur-lg shadow-sm border-b transition-colors duration-300`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600'
                                    : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                            } shadow-lg`}>
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <span className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                EduSphere
                            </span>
                        </div>

                        {/* Desktop Right Side */}
                        <div className="hidden md:flex items-center gap-3">
                            <button className={`relative p-2.5 rounded-xl transition-colors ${
                                theme === 'dark'
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}>
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                            </button>

                            <button
                                onClick={() => navigate('/profile')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    theme === 'dark'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-blue-100 text-blue-600'
                                }`}>
                                    <User size={18} />
                                </div>
                                <span className={`text-sm font-medium ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {user?.name}
                                </span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                                    theme === 'dark'
                                        ? 'text-red-400 hover:bg-red-500/10'
                                        : 'text-red-600 hover:bg-red-50'
                                }`}
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={`md:hidden p-2 rounded-xl ${
                                theme === 'dark'
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className={`md:hidden py-4 border-t ${
                            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <User size={20} />
                                    <span>Profile</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                        theme === 'dark'
                                            ? 'text-red-400 hover:bg-red-500/10'
                                            : 'text-red-600 hover:bg-red-50'
                                    }`}
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-fade-in">
                    <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className={`text-lg ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Here's what's happening with your classes today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 animate-slide-up">
                    {/* Stat Card 1 - Completed Assignments */}
                    <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:scale-105 ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700 hover:border-green-500/50'
                            : 'bg-white border-gray-100 hover:border-green-300'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                theme === 'dark'
                                    ? 'bg-green-500/20'
                                    : 'bg-green-100'
                            }`}>
                                <FileText className={`${
                                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                }`} size={24} />
                            </div>
                            <span className={`text-3xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {dashboardData.stats.completedAssignments}
                            </span>
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Completed Assignments
                        </p>
                        <div className={`mt-2 text-xs font-medium ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`}>
                            <span className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                Great progress!
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 2 - Pending Assignments */}
                    <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:scale-105 ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700 hover:border-yellow-500/50'
                            : 'bg-white border-gray-100 hover:border-yellow-300'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                theme === 'dark'
                                    ? 'bg-yellow-500/20'
                                    : 'bg-yellow-100'
                            }`}>
                                <Clock className={`${
                                    theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                }`} size={24} />
                            </div>
                            <span className={`text-3xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {dashboardData.stats.pendingAssignments}
                            </span>
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Pending Assignments
                        </p>
                        <div className={`mt-2 text-xs font-medium ${
                            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                            <span className="flex items-center gap-1">
                                <Target size={14} />
                                Stay on track
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 3 - Average Grade */}
                    <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:scale-105 ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700 hover:border-blue-500/50'
                            : 'bg-white border-gray-100 hover:border-blue-300'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                theme === 'dark'
                                    ? 'bg-blue-500/20'
                                    : 'bg-blue-100'
                            }`}>
                                <Award className={`${
                                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                }`} size={24} />
                            </div>
                            <span className={`text-3xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {dashboardData.stats.averageGrade}%
                            </span>
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Average Grade
                        </p>
                        <div className={`mt-2 text-xs font-medium ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                            <span className="flex items-center gap-1">
                                <Sparkles size={14} />
                                Excellent work!
                            </span>
                        </div>
                    </div>

                    {/* Stat Card 4 - Attendance */}
                    <div className={`rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:scale-105 ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-gray-700 hover:border-purple-500/50'
                            : 'bg-white border-gray-100 hover:border-purple-300'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                theme === 'dark'
                                    ? 'bg-purple-500/20'
                                    : 'bg-purple-100'
                            }`}>
                                <Calendar className={`${
                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                }`} size={24} />
                            </div>
                            <span className={`text-3xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {dashboardData.stats.attendance}%
                            </span>
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Attendance Rate
                        </p>
                        <div className={`mt-2 text-xs font-medium ${
                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                            <span className="flex items-center gap-1">
                                <TrendingUp size={14} />
                                Keep it up!
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Left Column - Upcoming Classes & Assignments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Classes */}
                        <div className={`rounded-2xl shadow-lg p-6 border transition-colors duration-300 ${
                            theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-white border-gray-100'
                        }`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold flex items-center gap-2 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    <Video size={24} className={`${
                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    }`} />
                                    Upcoming Classes
                                </h2>
                                <button className={`text-sm font-medium transition-colors ${
                                    theme === 'dark'
                                        ? 'text-blue-400 hover:text-blue-300'
                                        : 'text-blue-600 hover:text-blue-700'
                                }`}>
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.upcomingClasses.map((cls) => (
                                    <div key={cls.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                                        theme === 'dark'
                                            ? 'bg-gray-700/50 hover:bg-gray-700'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                theme === 'dark'
                                                    ? 'bg-blue-500/20'
                                                    : 'bg-blue-100'
                                            }`}>
                                                <Video className={`${
                                                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                                }`} size={20} />
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold ${
                                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {cls.name}
                                                </h3>
                                                <p className={`text-sm ${
                                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    {cls.teacher}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {cls.time}
                                            </p>
                                            <p className={`text-xs ${
                                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                            }`}>
                                                {cls.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Assignments */}
                        <div className={`rounded-2xl shadow-lg p-6 border transition-colors duration-300 ${
                            theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-white border-gray-100'
                        }`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl font-bold flex items-center gap-2 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    <FileText size={24} className={`${
                                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                    }`} />
                                    Recent Assignments
                                </h2>
                                <button
                                    onClick={() => navigate('/assignments')}
                                    className={`text-sm font-medium transition-colors ${
                                        theme === 'dark'
                                            ? 'text-blue-400 hover:text-blue-300'
                                            : 'text-blue-600 hover:text-blue-700'
                                    }`}
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.recentAssignments.map((assignment) => (
                                    <div key={assignment.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                                        theme === 'dark'
                                            ? 'bg-gray-700/50 hover:bg-gray-700'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold mb-1 ${
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {assignment.title}
                                            </h3>
                                            <p className={`text-sm ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                {assignment.subject}
                                            </p>
                                        </div>
                                        <div>
                                            {assignment.status === 'submitted' ? (
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                                    theme === 'dark'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    ✓ Submitted
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                                    theme === 'dark'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    Due in {assignment.due}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="space-y-6">
                        <div className={`rounded-2xl shadow-lg p-6 border transition-colors duration-300 ${
                            theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-white border-gray-100'
                        }`}>
                            <h2 className={`text-xl font-bold mb-6 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/live-class/1')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group hover:scale-[1.02] ${
                                        theme === 'dark'
                                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30'
                                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Video className={`${
                                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                        }`} size={20} />
                                        <span className={`font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Join Live Class
                                        </span>
                                    </div>
                                    <ChevronRight className={`transition-transform group-hover:translate-x-1 ${
                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    }`} size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/assignments')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group hover:scale-[1.02] ${
                                        theme === 'dark'
                                            ? 'bg-gray-700/50 hover:bg-gray-700'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className={`${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`} size={20} />
                                        <span className={`font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            View Assignments
                                        </span>
                                    </div>
                                    <ChevronRight className={`transition-transform group-hover:translate-x-1 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`} size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/materials')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group hover:scale-[1.02] ${
                                        theme === 'dark'
                                            ? 'bg-gray-700/50 hover:bg-gray-700'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className={`${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`} size={20} />
                                        <span className={`font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Study Materials
                                        </span>
                                    </div>
                                    <ChevronRight className={`transition-transform group-hover:translate-x-1 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`} size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/chat')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group hover:scale-[1.02] ${
                                        theme === 'dark'
                                            ? 'bg-gray-700/50 hover:bg-gray-700'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className={`${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`} size={20} />
                                        <span className={`font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Class Chat
                                        </span>
                                    </div>
                                    <ChevronRight className={`transition-transform group-hover:translate-x-1 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`} size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/doubt-assistant')}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group hover:scale-[1.02] ${
                                        theme === 'dark'
                                            ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30'
                                            : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className={`${
                                            theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                        }`} size={20} />
                                        <span className={`font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            AI Doubt Assistant
                                        </span>
                                    </div>
                                    <ChevronRight className={`transition-transform group-hover:translate-x-1 ${
                                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                                    }`} size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Motivational Card */}
                        <div className={`rounded-2xl shadow-lg p-6 border transition-colors duration-300 ${
                            theme === 'dark'
                                ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30'
                                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                        }`}>
                            <div className="text-center">
                                <div className="text-4xl mb-3">🎯</div>
                                <h3 className={`text-lg font-bold mb-2 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Keep Up the Great Work!
                                </h3>
                                <p className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    You're doing amazing this semester. Stay focused and keep learning!
                                </p>
                            </div>
                        </div>
                    </div>
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
                    animation: fade-in 0.6s ease-out;
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out 0.2s both;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;