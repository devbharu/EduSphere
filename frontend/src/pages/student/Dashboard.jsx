/**
 * Student Dashboard - Main dashboard for students
 * Shows upcoming classes, deadlines, performance, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    ChevronRight
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">EduSphere</span>
                        </div>

                        {/* Right Side - Notifications & Profile */}
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <User size={18} className="text-primary-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">{user?.name}</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium hidden md:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600">Here's what's happening with your classes today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stat Card 1 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="text-green-600" size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.completedAssignments}</span>
                        </div>
                        <p className="text-sm text-gray-600">Completed Assignments</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="text-yellow-600" size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.pendingAssignments}</span>
                        </div>
                        <p className="text-sm text-gray-600">Pending Assignments</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.averageGrade}%</span>
                        </div>
                        <p className="text-sm text-gray-600">Average Grade</p>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="text-purple-600" size={24} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{dashboardData.stats.attendance}%</span>
                        </div>
                        <p className="text-sm text-gray-600">Attendance Rate</p>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Upcoming Classes & Assignments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upcoming Classes */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Upcoming Classes</h2>
                                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.upcomingClasses.map((cls) => (
                                    <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                                <Video className="text-primary-600" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                                                <p className="text-sm text-gray-600">{cls.teacher}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{cls.time}</p>
                                            <p className="text-xs text-gray-500">{cls.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Assignments */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Recent Assignments</h2>
                                <button
                                    onClick={() => navigate('/assignments')}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.recentAssignments.map((assignment) => (
                                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                                            <p className="text-sm text-gray-600">{assignment.subject}</p>
                                        </div>
                                        <div className="text-right">
                                            {assignment.status === 'submitted' ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Submitted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
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
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/live-class/1')}
                                    className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Video className="text-primary-600" size={20} />
                                        <span className="font-medium text-gray-900">Join Live Class</span>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-primary-600" size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/assignments')}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-gray-600" size={20} />
                                        <span className="font-medium text-gray-900">View Assignments</span>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-gray-600" size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/materials')}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="text-gray-600" size={20} />
                                        <span className="font-medium text-gray-900">Study Materials</span>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-gray-600" size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/chat')}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="text-gray-600" size={20} />
                                        <span className="font-medium text-gray-900">Class Chat</span>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-gray-600" size={20} />
                                </button>

                                <button
                                    onClick={() => navigate('/doubt-assistant')}
                                    className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="text-indigo-600" size={20} />
                                        <span className="font-medium text-gray-900">AI Doubt Assistant</span>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-indigo-600" size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;