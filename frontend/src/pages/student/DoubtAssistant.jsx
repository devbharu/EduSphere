/**
 * AI Doubt Assistant - Upload handwritten questions (OCR) and get AI explanations
 * Powered by Python Flask backend for OCR and AI processing
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import UploadSolve from './AI_features/UploadSolve';
import ChatAI from './AI_features/ChatAI';

const DoubtAssistant = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upload'); // upload or chat

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-purple-600" size={24} />
                                <h1 className="text-2xl font-bold text-gray-900">AI Doubt Assistant</h1>
                            </div>
                            <p className="text-gray-600 text-sm">Upload handwritten questions or chat with AI</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'upload'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Upload & Solve
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'chat'
                                ? 'bg-purple-600 text-white'
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