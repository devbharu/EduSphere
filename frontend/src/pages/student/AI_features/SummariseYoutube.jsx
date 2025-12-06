import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Youtube,
    Loader,
    AlertCircle,
    CheckCircle,
    Link as LinkIcon,
    FileText,
    Clock,
    Eye,
    Lightbulb
} from 'lucide-react';

const SummariseYoutube = () => {
    const { theme } = useTheme();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null);

    const validateYoutubeUrl = (url) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!youtubeUrl.trim()) {
            setError('Please enter a YouTube URL');
            return;
        }

        if (!validateYoutubeUrl(youtubeUrl)) {
            setError('Please enter a valid YouTube URL');
            return;
        }

        setLoading(true);
        setError('');
        setSummary(null);

        try {
            const response = await fetch('http://localhost:5000/api/ai/summarize-youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ url: youtubeUrl })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to summarize video');
            }

            const data = await response.json();
            setSummary(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to summarize YouTube video:', err);
            setError(err.message || 'Failed to summarize video. Please try again.');
            setLoading(false);
        }
    };

    const handleReset = () => {
        setYoutubeUrl('');
        setSummary(null);
        setError('');
    };

    return (
        <div className="space-y-6">
            {/* Upload Form */}
            <div className={`rounded-2xl shadow-lg border p-6 ${
                theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-white border-gray-200'
            }`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${
                        theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                        <Youtube size={24} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            YouTube Video Summarizer
                        </h2>
                        <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            Get AI-powered summaries of educational videos
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className={`mb-4 p-4 rounded-xl border-l-4 ${
                        theme === 'dark'
                            ? 'bg-red-500/10 border-red-500 text-red-400'
                            : 'bg-red-50 border-red-500 text-red-700'
                    }`}>
                        <div className="flex items-center gap-2">
                            <AlertCircle size={20} />
                            <p className="font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {summary && (
                    <div className={`mb-4 p-4 rounded-xl border-l-4 ${
                        theme === 'dark'
                            ? 'bg-green-500/10 border-green-500 text-green-400'
                            : 'bg-green-50 border-green-500 text-green-700'
                    }`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            <p className="font-medium">Video summarized successfully!</p>
                        </div>
                    </div>
                )}

                {/* URL Input Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            YouTube Video URL
                        </label>
                        <div className="relative">
                            <LinkIcon 
                                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                }`} 
                                size={20} 
                            />
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className={`w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                                }`}
                                disabled={loading}
                            />
                        </div>
                        <p className={`text-xs mt-2 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                            Paste a YouTube video URL to get an AI-generated summary
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || !youtubeUrl.trim()}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                loading || !youtubeUrl.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg'
                            } text-white`}
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    <span>Analyzing Video...</span>
                                </>
                            ) : (
                                <>
                                    <Lightbulb size={20} />
                                    <span>Summarize Video</span>
                                </>
                            )}
                        </button>

                        {(summary || error) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Summary Display */}
            {summary && (
                <div className="space-y-4">
                    {/* Video Info */}
                    <div className={`rounded-2xl shadow-lg border p-6 ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            {summary.thumbnail && (
                                <img
                                    src={summary.thumbnail}
                                    alt="Video thumbnail"
                                    className="w-40 h-24 object-cover rounded-lg"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold mb-2 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {summary.title || 'Video Title'}
                                </h3>
                                <div className={`flex items-center gap-4 text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    {summary.channel && (
                                        <span className="flex items-center gap-1">
                                            <Youtube size={16} />
                                            {summary.channel}
                                        </span>
                                    )}
                                    {summary.duration && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={16} />
                                            {summary.duration}
                                        </span>
                                    )}
                                    {summary.views && (
                                        <span className="flex items-center gap-1">
                                            <Eye size={16} />
                                            {summary.views}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Content */}
                    <div className={`rounded-2xl shadow-lg border p-6 ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${
                                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                            }`}>
                                <FileText size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                            </div>
                            <h3 className={`text-lg font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Summary
                            </h3>
                        </div>

                        <div className={`prose max-w-none ${
                            theme === 'dark' ? 'prose-invert' : ''
                        }`}>
                            {summary.summary ? (
                                <div className={`space-y-4 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {summary.summary.split('\n').map((paragraph, index) => (
                                        paragraph.trim() && (
                                            <p key={index} className="leading-relaxed">
                                                {paragraph}
                                            </p>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    No summary available
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Key Points */}
                    {summary.keyPoints && summary.keyPoints.length > 0 && (
                        <div className={`rounded-2xl shadow-lg border p-6 ${
                            theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${
                                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                                }`}>
                                    <Lightbulb size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                </div>
                                <h3 className={`text-lg font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Key Points
                                </h3>
                            </div>

                            <ul className="space-y-2">
                                {summary.keyPoints.map((point, index) => (
                                    <li
                                        key={index}
                                        className={`flex items-start gap-3 p-3 rounded-lg ${
                                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                        }`}
                                    >
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            theme === 'dark'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <span className={`flex-1 ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            {point}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className={`rounded-2xl shadow-lg border p-12 ${
                    theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="text-center">
                        <Loader className={`mx-auto mb-4 animate-spin ${
                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} size={48} />
                        <h3 className={`text-lg font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            Analyzing Video...
                        </h3>
                        <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            This may take a moment. We're extracting and summarizing the content.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummariseYoutube;