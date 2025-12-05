import React, { useState, useEffect } from 'react';
import {
    Upload,
    X,
    Loader,
    Sparkles,
    Image as ImageLucide,
    Send,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const UploadSolve = () => {
    const [theme, setTheme] = useState('light');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [query, setQuery] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);

    // Fetch theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const handleFileSelect = (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (PNG, JPG, JPEG)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB');
            return;
        }

        setImageFile(file);
        setError('');

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.onerror = () => {
            setError('Failed to read the image file. Please try again.');
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        handleFileSelect(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const file = e.dataTransfer.files?.[0];
        handleFileSelect(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!imageFile) {
            setError('Please upload an image first');
            return;
        }

        if (!query.trim()) {
            setError('Please enter your question');
            return;
        }

        if (query.length > 500) {
            setError('Question must be 500 characters or less');
            return;
        }

        setLoading(true);
        setError('');
        setAiResponse('');
        setExtractedText('');

        try {
            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('query', query);
            formData.append('languages', 'en,hi'); // Default languages

            console.log('Sending request to OCR API...');

            // Send request to backend
            const response = await fetch('http://localhost:8000/ocr/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            console.log('OCR API Response:', data);

            if (!data.success) {
                throw new Error(data.error || 'Failed to process image');
            }

            // Set extracted text and AI answer
            setExtractedText(data.extracted_text || '');
            setAiResponse(data.answer || '');

            console.log('Extracted text:', data.extracted_text);
            console.log('AI Answer:', data.answer);

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to process your request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setQuery('');
        setExtractedText('');
        setAiResponse('');
        setError('');
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        AI Question Solver
                    </h1>
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Upload an image and ask your question to get instant AI-powered solutions
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Image Upload Section */}
                    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="p-6">
                            <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <ImageLucide size={18} />
                                Upload Image
                            </label>

                            {!imagePreview ? (
                                <label className="block cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                    <div 
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                                            dragActive
                                                ? theme === 'dark'
                                                    ? 'border-purple-500 bg-gray-700/70'
                                                    : 'border-purple-500 bg-purple-50'
                                                : theme === 'dark'
                                                    ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/50'
                                                    : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50/50'
                                        }`}
                                    >
                                        <Upload className={`mx-auto mb-4 ${
                                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`} size={48} />
                                        <p className={`font-medium mb-1 ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Click to upload or drag and drop
                                        </p>
                                        <p className={`text-sm ${
                                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                        }`}>
                                            PNG, JPG, JPEG (Max 10MB)
                                        </p>
                                    </div>
                                </label>
                            ) : (
                                <div className="relative animate-fade-in">
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        className="w-full h-auto max-h-96 object-contain rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={loading}
                                        className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${
                                            theme === 'dark'
                                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                : 'bg-white hover:bg-gray-100 text-gray-700'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                                        theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
                                    }`}>
                                        <CheckCircle size={14} className="text-green-500" />
                                        {imageFile.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Query Input Section */}
                    <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="p-6">
                            <label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <Sparkles size={18} />
                                Your Question
                            </label>
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., Explain this mathematical problem step by step..."
                                rows="4"
                                maxLength={500}
                                disabled={loading}
                                className={`w-full px-4 py-3 rounded-xl border-2 resize-none transition-all duration-200 placeholder:text-gray-400 focus:outline-none ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50'
                                        : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50'
                                }`}
                            />
                            <p className={`mt-2 text-xs ${
                                query.length > 450 
                                    ? 'text-orange-500' 
                                    : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                                {query.length} / 500 characters
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`rounded-xl border-l-4 px-5 py-4 animate-fade-in ${
                            theme === 'dark'
                                ? 'bg-red-900/20 border-red-500 text-red-400'
                                : 'bg-red-50 border-red-500 text-red-800'
                        }`}>
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !imageFile || !query.trim()}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                theme === 'dark'
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Solve with AI
                                </>
                            )}
                        </button>

                        {(imageFile || query || aiResponse) && !loading && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className={`px-6 py-3.5 rounded-xl font-medium transition-all duration-200 border-2 ${
                                    theme === 'dark'
                                        ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Extracted Text Section */}
                {extractedText && (
                    <div className={`mt-8 rounded-2xl border-2 overflow-hidden animate-fade-in ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-blue-500/30'
                            : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
                    }`}>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ImageLucide className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
                                <h3 className={`text-xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Extracted Text from Image
                                </h3>
                            </div>
                            <div className={`rounded-xl p-5 ${
                                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                            }`}>
                                <p className={`whitespace-pre-line leading-relaxed ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                                }`}>
                                    {extractedText}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Response Section */}
                {aiResponse && (
                    <div className={`mt-8 rounded-2xl border-2 overflow-hidden animate-fade-in ${
                        theme === 'dark'
                            ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30'
                            : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                    }`}>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={24} />
                                <h3 className={`text-xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    AI Solution
                                </h3>
                            </div>
                            <div className={`rounded-xl p-5 ${
                                theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
                            }`}>
                                <p className={`whitespace-pre-line leading-relaxed ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                                }`}>
                                    {aiResponse}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* How it Works Section */}
                <div className={`mt-8 p-5 border rounded-xl ${
                    theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/30'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                }`}>
                    <h3 className={`text-sm font-semibold mb-3 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        💡 How it works
                    </h3>
                    <ul className={`space-y-2 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                        <li className="flex items-start gap-2">
                            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>1.</span>
                            <span>Upload an image containing your question (handwritten or printed)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>2.</span>
                            <span>Describe what you need help with in the text field</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>3.</span>
                            <span>Our AI will extract text using OCR and analyze the image</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>4.</span>
                            <span>Get step-by-step explanations powered by advanced AI</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UploadSolve;