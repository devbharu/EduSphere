/**
 * AI Doubt Assistant - Upload handwritten questions (OCR) and get AI explanations
 * Powered by Python Flask backend for OCR and AI processing
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    Camera,
    Send,
    Loader,
    CheckCircle,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import aiService from '../../services/aiService';

const DoubtAssistant = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upload'); // upload or chat
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setError('');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAndExtract = async () => {
        if (!imageFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError('');
        setExtractedText('');
        setAiResponse('');

        try {
            // Step 1: Extract text using OCR
            const ocrResult = await aiService.uploadQuestionImage(imageFile);
            setExtractedText(ocrResult.extractedText || ocrResult.text);

            // Step 2: Get AI explanation
            const aiResult = await aiService.getAIExplanation(ocrResult.extractedText || ocrResult.text);
            setAiResponse(aiResult.explanation || aiResult.answer);

        } catch (err) {
            setError(err.message || 'Failed to process image. Please try again.');
            console.error('OCR/AI Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            message: chatInput,
            time: new Date().toLocaleTimeString(),
        };

        setChatHistory(prev => [...prev, userMessage]);
        setChatInput('');
        setLoading(true);

        try {
            const aiResult = await aiService.chatWithAI(chatInput, chatHistory);

            const aiMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                message: aiResult.response || aiResult.answer,
                time: new Date().toLocaleTimeString(),
            };

            setChatHistory(prev => [...prev, aiMessage]);
        } catch (err) {
            setError('Failed to get AI response. Please try again.');
            console.error('Chat Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
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
                {activeTab === 'upload' ? (
                    // Upload & OCR Tab
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Upload */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Your Question</h2>

                                {/* Upload Area */}
                                <div className="mb-4">
                                    <label className="block w-full">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 cursor-pointer transition-colors">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="max-w-full h-64 object-contain mx-auto mb-4" />
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                                                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                                                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={handleUploadAndExtract}
                                    disabled={!imageFile || loading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Solve with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Right Column - Results */}
                        <div className="space-y-6">
                            {/* Extracted Text */}
                            {extractedText && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle className="text-green-600" size={20} />
                                        <h3 className="text-lg font-bold text-gray-900">Extracted Question</h3>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-800">{extractedText}</p>
                                    </div>
                                </div>
                            )}

                            {/* AI Response */}
                            {aiResponse && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border border-purple-200 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="text-purple-600" size={20} />
                                        <h3 className="text-lg font-bold text-gray-900">AI Explanation</h3>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <p className="text-gray-800 whitespace-pre-line">{aiResponse}</p>
                                    </div>
                                </div>
                            )}

                            {!extractedText && !aiResponse && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <Camera className="mx-auto text-gray-400 mb-4" size={64} />
                                    <p className="text-gray-600">Upload an image to see the results here</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Chat Tab
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Chat with AI Assistant</h2>
                                <p className="text-sm text-gray-600">Ask any question and get instant help</p>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {chatHistory.length === 0 && (
                                    <div className="text-center py-12">
                                        <Sparkles className="mx-auto text-purple-600 mb-4" size={48} />
                                        <p className="text-gray-600 mb-2">Start a conversation with AI</p>
                                        <p className="text-sm text-gray-500">Ask me anything about your studies!</p>
                                    </div>
                                )}

                                {chatHistory.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xl ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                                            <div
                                                className={`rounded-lg px-4 py-3 ${msg.sender === 'user'
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-line">{msg.message}</p>
                                                <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                                                    {msg.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Loader className="animate-spin text-purple-600" size={16} />
                                                <span className="text-gray-600">AI is thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                                        placeholder="Ask your question..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        onClick={handleChatSend}
                                        disabled={!chatInput.trim() || loading}
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoubtAssistant;