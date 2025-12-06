/**
 * Assignments & Assessments Page - Main container with tabs
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, FileText, ClipboardCheck } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import AssignmentsTab from './AssignmentAssessment/Assignments';
import AssessmentsTab from './AssignmentAssessment/Assessments';

const Assignments = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'assessments'

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
                            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Assignments & Assessments
                            </h1>
                            <p className={`text-sm mt-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Manage your coursework and tests
                            </p>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'assignments'
                                    ? theme === 'dark'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <FileText size={18} />
                            <span>Assignments</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('assessments')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'assessments'
                                    ? theme === 'dark'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <ClipboardCheck size={18} />
                            <span>Assessments</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'assignments' ? <AssignmentsTab /> : <AssessmentsTab />}
            </div>
        </div>
    );
};

export default Assignments;