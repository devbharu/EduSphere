import React, { useState, useRef } from 'react';
import {
    Send,
    Loader,
    Sparkles,
    Upload,
    FileText,
    X,
    AlertCircle,
    Volume2,
    VolumeX
} from 'lucide-react';

const ChatAI = () => {
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isPdfUploaded, setIsPdfUploaded] = useState(false);
    const [enableTTS, setEnableTTS] = useState(false);
    const fileInputRef = useRef(null);
    const audioRef = useRef(new Audio());

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError('File size must be less than 10MB');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setError('');
        setUploadLoading(true);
        setUploadedFile(file);

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Upload PDF to backend
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload PDF');
            }

            const result = await response.json();
            
            if (result.success) {
                setIsPdfUploaded(true);
                
                const systemMessage = {
                    id: Date.now(),
                    sender: 'system',
                    message: `✅ PDF "${file.name}" uploaded successfully! You can now ask questions about it.`,
                    time: new Date().toLocaleTimeString(),
                };

                setChatHistory(prev => [...prev, systemMessage]);
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            setError(err.message || 'Failed to upload PDF. Please try again.');
            console.error('PDF Upload Error:', err);
            setUploadedFile(null);
            setIsPdfUploaded(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setUploadLoading(false);
        }
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setIsPdfUploaded(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        const systemMessage = {
            id: Date.now(),
            sender: 'system',
            message: '❌ PDF removed. Please upload a new PDF to continue.',
            time: new Date().toLocaleTimeString(),
        };

        setChatHistory(prev => [...prev, systemMessage]);
    };

    const convertTextToSpeech = async (text) => {
        try {
            const response = await fetch('http://localhost:8000/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    inline: true
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const result = await response.json();

            if (result.success && result.audio_base64) {
                // Convert base64 to blob
                const binary = atob(result.audio_base64);
                const len = binary.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);

                // Play audio
                audioRef.current.pause();
                audioRef.current.src = url;
                await audioRef.current.play();

                console.log(`TTS played successfully (Language: ${result.detected_language})`);
            }
        } catch (err) {
            console.error('TTS Error:', err);
            // Don't show error to user, just log it
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;

        // Check if PDF is uploaded
        if (!isPdfUploaded) {
            setError('Please upload a PDF file first before asking questions.');
            return;
        }

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            message: chatInput,
            time: new Date().toLocaleTimeString(),
        };

        setChatHistory(prev => [...prev, userMessage]);
        const question = chatInput;
        setChatInput('');
        setLoading(true);
        setError('');

        try {
            // Send question to retrieve endpoint
            const response = await fetch('http://localhost:8000/retrieve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get AI response');
            }

            const result = await response.json();

            if (result.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    message: result.answer,
                    time: new Date().toLocaleTimeString(),
                };

                setChatHistory(prev => [...prev, aiMessage]);

                // Auto-play TTS if enabled
                if (enableTTS) {
                    await convertTextToSpeech(result.answer);
                }
            } else {
                throw new Error('Failed to retrieve answer');
            }
        } catch (err) {
            setError(err.message || 'Failed to get AI response. Please try again.');
            console.error('Chat Error:', err);
            
            const errorMessage = {
                id: Date.now() + 1,
                sender: 'system',
                message: `⚠️ Error: ${err.message}`,
                time: new Date().toLocaleTimeString(),
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const toggleTTS = () => {
        setEnableTTS(!enableTTS);
        if (enableTTS) {
            stopAudio();
        }
    };

    return (
        <div className="max-w-4xl mx-auto relative">
            {/* Upload Loading Overlay */}
            {uploadLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
                        <Loader className="animate-spin text-purple-600" size={48} />
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Uploading PDF...</h3>
                            <p className="text-sm text-gray-600">
                                Please wait while we process your document
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                {uploadedFile?.name}
                            </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Chat with AI Assistant</h2>
                            <p className="text-sm text-gray-600">Upload a PDF and ask questions about it</p>
                        </div>

                        {/* TTS Toggle Button */}
                        <button
                            onClick={toggleTTS}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                enableTTS
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={enableTTS ? 'TTS Enabled' : 'TTS Disabled'}
                        >
                            {enableTTS ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            <span className="text-sm font-medium">
                                {enableTTS ? 'TTS ON' : 'TTS OFF'}
                            </span>
                        </button>
                    </div>
                    
                    {/* Uploaded File Indicator */}
                    {uploadedFile && (
                        <div className="mt-3 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                            <FileText className="text-purple-600" size={16} />
                            <span className="text-sm text-purple-900 flex-1 truncate">{uploadedFile.name}</span>
                            {isPdfUploaded && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    Ready
                                </span>
                            )}
                            <button
                                onClick={handleRemoveFile}
                                className="text-purple-600 hover:text-purple-800"
                                disabled={loading || uploadLoading}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Warning if no PDF uploaded */}
                    {!isPdfUploaded && !uploadLoading && (
                        <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                            <AlertCircle className="text-yellow-600" size={16} />
                            <span className="text-xs text-yellow-900">Please upload a PDF file to start chatting</span>
                        </div>
                    )}

                    {/* TTS Status */}
                    {enableTTS && isPdfUploaded && (
                        <div className="mt-2 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                            <Volume2 className="text-purple-600" size={14} />
                            <span className="text-xs text-purple-900">
                                🌍 Multilingual TTS enabled - AI responses will be spoken automatically
                            </span>
                        </div>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center py-12">
                            <Sparkles className="mx-auto text-purple-600 mb-4" size={48} />
                            <p className="text-gray-600 mb-2">Start a conversation with AI</p>
                            <p className="text-sm text-gray-500">Upload a PDF and ask questions about it!</p>
                            <p className="text-xs text-gray-400 mt-2">🎤 Enable TTS for voice responses</p>
                        </div>
                    )}

                    {chatHistory.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex ${
                                msg.sender === 'user' ? 'justify-end' : 
                                msg.sender === 'system' ? 'justify-center' : 
                                'justify-start'
                            }`}
                        >
                            <div className={`max-w-xl ${
                                msg.sender === 'user' ? 'order-2' : 
                                msg.sender === 'system' ? '' : 
                                'order-1'
                            }`}>
                                <div
                                    className={`rounded-lg px-4 py-3 ${
                                        msg.sender === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : msg.sender === 'system'
                                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="whitespace-pre-line">{msg.message}</p>
                                    
                                    {/* Manual Play Button for AI messages */}
                                    {msg.sender === 'ai' && (
                                        <button
                                            onClick={() => convertTextToSpeech(msg.message)}
                                            className="mt-2 flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full transition-colors"
                                        >
                                            <Volume2 size={12} />
                                            Play Audio
                                        </button>
                                    )}
                                    
                                    <p className={`text-xs mt-2 ${
                                        msg.sender === 'user' ? 'text-purple-100' : 
                                        msg.sender === 'system' ? 'text-blue-700' :
                                        'text-gray-500'
                                    }`}>
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
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                        {/* Upload Button */}
                        <div className="relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={loading || uploadLoading}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading || uploadLoading}
                                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Upload PDF"
                            >
                                <Upload size={20} />
                            </button>
                        </div>

                        {/* Text Input */}
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && !uploadLoading && handleChatSend()}
                            placeholder={isPdfUploaded ? "Ask your question..." : "Upload a PDF first..."}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                            disabled={loading || !isPdfUploaded || uploadLoading}
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleChatSend}
                            disabled={!chatInput.trim() || loading || !isPdfUploaded || uploadLoading}
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