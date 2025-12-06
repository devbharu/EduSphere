// src/components/CreateLiveClassModal.jsx (Final Update)

import React, { useState } from 'react';
import { X, Video, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useWebRTCCall } from '../context/WebRTCContext'; // <--- Get function from context

// NOTE: The 'api' import is no longer strictly required for the POST logic,
// as that logic is now contained within the WebRTCContext.

const CreateLiveClassModal = ({ isOpen, onClose, onCreateSuccess }) => {
    const { theme } = useTheme();

    // Get the new function from the context
    const { createLiveClass } = useWebRTCCall();

    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title.trim() || !subject.trim()) {
            setError('Please provide a title and a subject.');
            return;
        }

        setLoading(true);
        try {
            // 1. Call the centralized context function for creation
            const newClass = await createLiveClass(title, subject);

            // 2. Call the success handler passed from the parent component (Dashboard.jsx)
            //    This handler will navigate the creator to the new room.
            if (onCreateSuccess) {
                onCreateSuccess(newClass);
            }

            // Reset form and close modal
            setTitle('');
            setSubject('');
            onClose();

        } catch (err) {
            console.error("Failed to create live class:", err);
            // Error handling is cleaner since the context throws the specific error message
            setError(err.message || 'Failed to create live class. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Tailwind CSS classes for dynamic styling
    const modalBg = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const inputStyle = theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300';
    const buttonStyle = loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 border ${modalBg} transform transition-all duration-300 scale-100`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <Video size={24} className="text-indigo-500" /> Start New Live Class
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 dark:bg-red-900/30 dark:text-red-400" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Class Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={`w-full p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${inputStyle}`}
                            placeholder="e.g., Calculus 101 - Derivatives"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Subject / Topic
                        </label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className={`w-full p-3 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500 ${inputStyle}`}
                            placeholder="e.g., Mathematics"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-colors ${buttonStyle}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Video size={20} />
                                Start Live Class
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateLiveClassModal;