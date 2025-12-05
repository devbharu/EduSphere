/**
 * Assignments Page - View, submit, and track assignments
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle,
    Upload,
    Calendar,
    Filter,
    Search
} from 'lucide-react';
import aiService from '../../services/aiService';

const Assignments = () => {
    const navigate = useNavigate();
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
                        grade: 85,
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={14} className="mr-1" />
                    Graded: {grade}%
                </span>
            );
        } else if (status === 'submitted') {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle size={14} className="mr-1" />
                    Submitted
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={14} className="mr-1" />
                    Pending
                </span>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                            <p className="text-gray-600 text-sm">View and submit your assignments</p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search assignments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('submitted')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'submitted'
                                    ? 'bg-primary-600 text-white'
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
                    <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No assignments found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAssignments.map((assignment) => (
                            <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                                        <p className="text-sm text-primary-600 font-medium">{assignment.subject}</p>
                                    </div>
                                    {getStatusBadge(assignment.status, assignment.grade)}
                                </div>

                                <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar size={16} />
                                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                    </div>

                                    {assignment.status === 'pending' && (
                                        <button
                                            onClick={() => {
                                                setSelectedAssignment(assignment);
                                                setShowUploadModal(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                                        >
                                            <Upload size={16} />
                                            Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Assignment</h2>
                        <p className="text-gray-600 mb-4">{selectedAssignment?.title}</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload File
                            </label>
                            <input
                                type="file"
                                onChange={handleFileSelect}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {uploadFile && (
                                <p className="text-sm text-gray-600 mt-2">Selected: {uploadFile.name}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadFile(null);
                                    setSelectedAssignment(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitAssignment}
                                disabled={!uploadFile || uploading}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;