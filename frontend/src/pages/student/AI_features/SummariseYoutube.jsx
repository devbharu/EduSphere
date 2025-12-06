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
    Lightbulb,
    List,
    BarChart3
} from 'lucide-react';

const SummariseYoutube = () => {
    const { theme } = useTheme();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [summaryType, setSummaryType] = useState('detailed'); // bullet, detailed, brief

    const validateYoutubeUrl = (url) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url);
    };

    const extractVideoId = (url) => {
        if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }
        return null;
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
        setResult(null);

        try {
            // Call Python backend directly
            const response = await fetch('http://localhost:8000/youtube/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    youtube_url: youtubeUrl,
                    summary_type: summaryType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to summarize video');
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error('Failed to process video');
            }

            setResult(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to summarize YouTube video:', err);
            setError(err.message || 'Failed to summarize video. Please try again.');
            setLoading(false);
        }
    };

    const handleReset = () => {
        setYoutubeUrl('');
        setResult(null);
        setError('');
    };

    const formatTranscriptLength = (length) => {
        if (length < 1000) return `${length} characters`;
        if (length < 1000000) return `${(length / 1000).toFixed(1)}K characters`;
        return `${(length / 1000000).toFixed(1)}M characters`;
    };

    return (
        <div className="space-y-6">
            {/* Input Form */}
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
                {result && (
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

                    {/* Summary Type Selection */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                            Summary Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setSummaryType('bullet')}
                                disabled={loading}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                    summaryType === 'bullet'
                                        ? theme === 'dark'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-purple-500 bg-purple-50'
                                        : theme === 'dark'
                                            ? 'border-gray-600 hover:border-gray-500'
                                            : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <List size={20} className={`mx-auto mb-1 ${
                                    summaryType === 'bullet'
                                        ? 'text-purple-500'
                                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`} />
                                <p className={`text-xs font-medium ${
                                    summaryType === 'bullet'
                                        ? 'text-purple-500'
                                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Bullet Points
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSummaryType('brief')}
                                disabled={loading}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                    summaryType === 'brief'
                                        ? theme === 'dark'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-purple-500 bg-purple-50'
                                        : theme === 'dark'
                                            ? 'border-gray-600 hover:border-gray-500'
                                            : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <FileText size={20} className={`mx-auto mb-1 ${
                                    summaryType === 'brief'
                                        ? 'text-purple-500'
                                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`} />
                                <p className={`text-xs font-medium ${
                                    summaryType === 'brief'
                                        ? 'text-purple-500'
                                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Brief
                                </p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSummaryType('detailed')}
                                disabled={loading}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                    summaryType === 'detailed'
                                        ? theme === 'dark'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-purple-500 bg-purple-50'
                                        : theme === 'dark'
                                            ? 'border-gray-600 hover:border-gray-500'
                                            : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <BarChart3 size={20} className={`mx-auto mb-1 ${
                                    summaryType === 'detailed'
                                        ? 'text-purple-500'
                                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`} />
                                <p className={`text-xs font-medium ${
                                    summaryType === 'detailed'
                                        ? 'text-purple-500'
                                        : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Detailed
                                </p>
                            </button>
                        </div>
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

                        {(result || error) && (
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

            {/* Results Display */}
            {result && (
                <div className="space-y-4">
                    {/* Video Info Card */}
                    <div className={`rounded-2xl shadow-lg border p-6 ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="flex items-start gap-4">
                            {/* Video Thumbnail */}
                            {result.video_id && (
                                <img
                                    src={`https://img.youtube.com/vi/${result.video_id}/hqdefault.jpg`}
                                    alt="Video thumbnail"
                                    className="w-40 h-24 object-cover rounded-lg flex-shrink-0"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold mb-2 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Video Summary
                                </h3>
                                <div className={`flex flex-wrap items-center gap-4 text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    <span className="flex items-center gap-1">
                                        <Youtube size={16} />
                                        Video ID: {result.video_id}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={16} />
                                        Transcript: {formatTranscriptLength(result.transcript_length)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        theme === 'dark'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-purple-100 text-purple-700'
                                    }`}>
                                        {result.summary_type}
                                    </span>
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
                                <Lightbulb size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                            </div>
                            <h3 className={`text-lg font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                AI-Generated Summary
                            </h3>
                        </div>

                        <div className={`prose max-w-none ${
                            theme === 'dark' ? 'prose-invert' : ''
                        }`}>
                            {result.summary ? (
                                <div className={`whitespace-pre-wrap leading-relaxed ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    {result.summary}
                                </div>
                            ) : (
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    No summary available
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Transcript Section (Collapsible) */}
                    {result.transcript && (
                        <details className={`rounded-2xl shadow-lg border overflow-hidden ${
                            theme === 'dark'
                                ? 'bg-gray-800/50 border-gray-700'
                                : 'bg-white border-gray-200'
                        }`}>
                            <summary className={`p-6 cursor-pointer hover:bg-opacity-80 transition-all ${
                                theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                                    }`}>
                                        <FileText size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            Full Transcript
                                        </h3>
                                        <p className={`text-sm ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Click to view the complete video transcript
                                        </p>
                                    </div>
                                </div>
                            </summary>
                            <div className="p-6 border-t border-gray-700">
                                <div className={`max-h-96 overflow-y-auto p-4 rounded-lg ${
                                    theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
                                }`}>
                                    <p className={`whitespace-pre-wrap leading-relaxed text-sm ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {result.transcript}
                                    </p>
                                </div>
                            </div>
                        </details>
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
                            Extracting transcript and generating {summaryType} summary
                        </p>
                        <div className={`mt-4 flex items-center justify-center gap-2 text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                            <Clock size={14} />
                            <span>This may take up to 30 seconds...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummariseYoutube;