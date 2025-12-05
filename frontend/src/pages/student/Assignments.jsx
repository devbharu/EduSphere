/**
 * Assignments Page - View, submit, and track assignments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle,
    Upload,
    Calendar,
    Filter,
    Search,
    Award,
    AlertCircle,
    X,
    File,
    TrendingUp,
    BookOpen,
    Target
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import aiService from '../../services/aiService';

const Assignments = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, submitted
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadAssignments();
    }, [filter]);

    const loadAssignments = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            setTimeout(() => {
                setAssignments([
                    {
                        id: 1,
                        title: 'Calculus Problem Set - Chapter 5',
                        subject: 'Mathematics',
                        description: 'Complete problems 1-20 from Chapter 5',
                        dueDate: '2024-03-15',
                        submittedDate: null,
                        status: 'pending',
                        grade: null,
                        totalMarks: 100,
                    },
                    {
                        id: 2,
                        title: 'Physics Lab Report - Newton\'s Laws',
                        subject: 'Physics',
                        description: 'Write a detailed lab report on Newton\'s Laws experiment',
                        dueDate: '2024-03-18',
                        submittedDate: null,
                        status: 'pending',
                        grade: null,
                        totalMarks: 50,
                    },
                    {
                        id: 3,
                        title: 'Essay on Organic Chemistry',
                        subject: 'Chemistry',
                        description: 'Write a 1000-word essay on Organic Chemistry applications',
                        dueDate: '2024-03-10',
                        submittedDate: '2024-03-09',
                        status: 'submitted',
                        grade: null,
                        totalMarks: 100,
                    },
                    {
                        id: 4,
                        title: 'Programming Assignment - Data Structures',
                        subject: 'Computer Science',
                        description: 'Implement a binary search tree in Python',
                        dueDate: '2024-03-20',
                        submittedDate: '2024-03-19',
                        status: 'graded',
                        grade: 92,
                        totalMarks: 100,
                    },
                ]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to load assignments:', error);
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleSubmitAssignment = async () => {
        if (!uploadFile || !selectedAssignment) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('assignmentId', selectedAssignment.id);

            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert('Assignment submitted successfully!');
            setShowUploadModal(false);
            setUploadFile(null);
            setSelectedAssignment(null);
            loadAssignments();
        } catch (error) {
            console.error('Failed to submit assignment:', error);
            alert('Failed to submit assignment. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'pending' && assignment.status === 'pending') ||
            (filter === 'submitted' && (assignment.status === 'submitted' || assignment.status === 'graded'));

        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.subject.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status, grade) => {
        if (status === 'graded') {
            return (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    theme === 'dark'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                    <Award size={14} className="mr-1.5" />
                    Graded: {grade}%
                </span>
            );
        } else if (status === 'submitted') {
            return (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                    <CheckCircle size={14} className="mr-1.5" />
                    Submitted
                </span>
            );
        } else {
            return (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    theme === 'dark'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                    <Clock size={14} className="mr-1.5" />
                    Pending
                </span>
            );
        }
    };

    const getDaysRemaining = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const stats = {
        total: assignments.length,
        pending: assignments.filter(a => a.status === 'pending').length,
        submitted: assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
        avgGrade: Math.round(
            assignments
                .filter(a => a.grade !== null)
                .reduce((sum, a) => sum + a.grade, 0) / 
            assignments.filter(a => a.grade !== null).length || 0
        )
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className={`absolute inset-0 border-4 rounded-full ${
                            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                        }`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
                            theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                        }`}></div>
                    </div>
                    <p className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading assignments...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-lg shadow-sm border-b transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700'
                    : 'bg-white/80 border-gray-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                                theme === 'dark'
                                    ? 'hover:bg-gray-700'
                                    : 'hover:bg-gray-100'
                            }`}
                            aria-label="Back to Dashboard"
                        >
                            <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                        </button>
                        <div className="flex-1">
                            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                <div className={`p-2 rounded-xl ${
                                    theme === 'dark'
                                        ? 'bg-blue-500/20'
                                        : 'bg-blue-100'
                                }`}>
                                    <FileText size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                </div>
                                My Assignments
                            </h1>
                            <p className={`text-sm mt-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Track and submit your coursework
                            </p>
                        </div>
                    </div>

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
                                    }`}>Submitted</p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{stats.submitted}</p>
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
                                    <Award size={18} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                </div>
                                <div>
                                    <p className={`text-xs font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Avg Grade</p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{stats.avgGrade}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`} size={18} />
                            <input
                                type="text"
                                placeholder="Search by title or subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                }`}
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'all'
                                        ? theme === 'dark'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : theme === 'dark'
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'pending'
                                        ? theme === 'dark'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : theme === 'dark'
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('submitted')}
                                className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    filter === 'submitted'
                                        ? theme === 'dark'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : theme === 'dark'
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Submitted
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredAssignments.length === 0 ? (
                    <div className={`text-center py-16 rounded-2xl border ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <FileText size={40} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            No Assignments Found
                        </h3>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {searchQuery ? 'Try adjusting your search' : 'Check back later for new assignments'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredAssignments.map((assignment) => {
                            const daysRemaining = getDaysRemaining(assignment.dueDate);
                            const isOverdue = daysRemaining < 0 && assignment.status === 'pending';
                            const isDueSoon = daysRemaining <= 3 && daysRemaining >= 0 && assignment.status === 'pending';

                            return (
                                <div
                                    key={assignment.id}
                                    className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                                        theme === 'dark'
                                            ? 'bg-gray-800/50 border-gray-700'
                                            : 'bg-white border-gray-100'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className={`p-2 rounded-lg ${
                                                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                                                }`}>
                                                    <FileText size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`text-lg font-bold mb-1 ${
                                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                        {assignment.title}
                                                    </h3>
                                                    <p className={`text-sm font-semibold ${
                                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                                    }`}>
                                                        {assignment.subject}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {getStatusBadge(assignment.status, assignment.grade)}
                                    </div>

                                    <p className={`text-sm mb-5 line-clamp-2 ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {assignment.description}
                                    </p>

                                    <div className={`flex items-center justify-between pt-4 border-t ${
                                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                    }`}>
                                        <div className="flex flex-col gap-2">
                                            <div className={`flex items-center gap-2 text-sm ${
                                                isOverdue
                                                    ? 'text-red-500 font-semibold'
                                                    : isDueSoon
                                                    ? 'text-yellow-500 font-semibold'
                                                    : theme === 'dark'
                                                    ? 'text-gray-400'
                                                    : 'text-gray-600'
                                            }`}>
                                                <Calendar size={16} />
                                                <span>
                                                    Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            {assignment.status === 'pending' && (
                                                <div className={`flex items-center gap-2 text-xs font-medium ${
                                                    isOverdue
                                                        ? 'text-red-500'
                                                        : isDueSoon
                                                        ? 'text-yellow-500'
                                                        : theme === 'dark'
                                                        ? 'text-gray-500'
                                                        : 'text-gray-500'
                                                }`}>
                                                    {isOverdue ? (
                                                        <>
                                                            <AlertCircle size={14} />
                                                            <span>Overdue by {Math.abs(daysRemaining)} day{Math.abs(daysRemaining) !== 1 ? 's' : ''}</span>
                                                        </>
                                                    ) : isDueSoon ? (
                                                        <>
                                                            <AlertCircle size={14} />
                                                            <span>Due in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Target size={14} />
                                                            <span>{daysRemaining} days remaining</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            {assignment.status === 'submitted' && assignment.submittedDate && (
                                                <div className={`flex items-center gap-2 text-xs ${
                                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                }`}>
                                                    <CheckCircle size={14} />
                                                    <span>Submitted on {new Date(assignment.submittedDate).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {assignment.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedAssignment(assignment);
                                                    setShowUploadModal(true);
                                                }}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                                                    theme === 'dark'
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                                }`}
                                            >
                                                <Upload size={16} />
                                                <span>Submit</span>
                                            </button>
                                        )}

                                        {assignment.status === 'graded' && (
                                            <div className={`text-right`}>
                                                <div className={`text-2xl font-bold mb-1 ${
                                                    assignment.grade >= 80
                                                        ? 'text-green-500'
                                                        : assignment.grade >= 60
                                                        ? 'text-yellow-500'
                                                        : 'text-red-500'
                                                }`}>
                                                    {assignment.grade}%
                                                </div>
                                                <p className={`text-xs ${
                                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                }`}>
                                                    out of {assignment.totalMarks}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className={`rounded-2xl max-w-md w-full shadow-2xl border transition-colors duration-300 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${
                            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <h2 className={`text-xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Submit Assignment
                            </h2>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadFile(null);
                                    setSelectedAssignment(null);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-5">
                            <div className={`p-4 rounded-xl border ${
                                theme === 'dark'
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                                <h3 className={`font-semibold mb-1 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {selectedAssignment?.title}
                                </h3>
                                <p className={`text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    {selectedAssignment?.subject}
                                </p>
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-3 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Upload Your File
                                </label>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                                    uploadFile
                                        ? theme === 'dark'
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-green-500 bg-green-50'
                                        : theme === 'dark'
                                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                                }`}>
                                    <input
                                        type="file"
                                        id="file-upload"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`p-3 rounded-full ${
                                                uploadFile
                                                    ? theme === 'dark'
                                                        ? 'bg-green-500/20'
                                                        : 'bg-green-100'
                                                    : theme === 'dark'
                                                    ? 'bg-gray-600'
                                                    : 'bg-gray-200'
                                            }`}>
                                                {uploadFile ? (
                                                    <CheckCircle size={24} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                                                ) : (
                                                    <Upload size={24} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                                                )}
                                            </div>
                                            {uploadFile ? (
                                                <div>
                                                    <p className={`text-sm font-semibold mb-1 ${
                                                        theme === 'dark' ? 'text-green-400' : 'text-green-700'
                                                    }`}>
                                                        File Selected
                                                    </p>
                                                    <p className={`text-xs ${
                                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        {uploadFile.name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className={`text-sm font-semibold mb-1 ${
                                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                        Click to upload file
                                                    </p>
                                                    <p className={`text-xs ${
                                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                    }`}>
                                                        PDF, DOC, DOCX up to 10MB
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className={`flex gap-3 p-6 border-t ${
                            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadFile(null);
                                    setSelectedAssignment(null);
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitAssignment}
                                disabled={!uploadFile || uploading}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${
                                    theme === 'dark'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                }`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        <span>Submit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Assignments;