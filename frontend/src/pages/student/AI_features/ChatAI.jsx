import React, { useState } from 'react';
import {
    Send,
    Loader,
    Sparkles
} from 'lucide-react';
import aiService from '../../../services/aiService';

const ChatAI = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        setError('');

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

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
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
                            onKeyPress={(e) => e.key === 'Enter' && !loading && handleChatSend()}
                            placeholder="Ask your question..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={loading}
                        />
                        <button
                            onClick={handleChatSend}
                            disabled={!chatInput.trim() || loading}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatAI;