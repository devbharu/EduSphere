/**
 * AI Doubt Assistant - Upload handwritten questions (OCR) and get AI explanations
 * Powered by Python Flask backend for OCR and AI processing
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import UploadSolve from './AI_features/UploadSolve';
import ChatAI from './AI_features/ChatAI';
import ThemeToggle from '../../components/ThemeToggle';

const DoubtAssistant = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('upload'); // upload or chat

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
                    : 'bg-white/80 border-gray-200/60'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
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
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className={`${
                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                }`} size={24} />
                                <h1 className={`text-2xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    AI Doubt Assistant
                                </h1>
                            </div>
                            <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Upload handwritten questions or chat with AI
                            </p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'upload'
                                    ? theme === 'dark'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                    : theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Upload & Solve
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'chat'
                                    ? theme === 'dark'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                                    : theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Chat with AI
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'upload' ? <UploadSolve /> : <ChatAI />}
            </div>
        </div>
    );
};

export default DoubtAssistant;