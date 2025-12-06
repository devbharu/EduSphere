import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import {
    ArrowLeft,
    Upload,
    FileText,
    Sparkles,
    Loader,
    CheckCircle,
    AlertCircle,
    Trash2,
    Brain
} from 'lucide-react';
import ThemeToggle from '../../../components/ThemeToggle';

const AiAssessmentGeneration = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [pdfFile, setPdfFile] = useState(null);
    const [pdfPreview, setPdfPreview] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [assessmentTitle, setAssessmentTitle] = useState('');
    const [assessmentTopic, setAssessmentTopic] = useState('');
    const [uploading, setUploading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1); // 1: Upload, 2: Generating, 3: Success

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size should be less than 10MB');
                return;
            }
            setPdfFile(file);
            setPdfPreview(file.name);
            setError('');
        }
    };

    const handleRemoveFile = () => {
        setPdfFile(null);
        setPdfPreview('');
        setError('');
    };

    const uploadPdfToRag = async () => {
        try {
            const formData = new FormData();
            formData.append('file', pdfFile);

            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload PDF');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            throw new Error(`PDF upload failed: ${err.message}`);
        }
    };

    const generateQuestionsFromRag = async (numQuestions) => {
        try {
            const query = `Generate exactly ${numQuestions} multiple choice questions based on the content of this document. 
            
For each question, provide:
1. A clear question text
2. Four options labeled A, B, C, D
3. Indicate which option is correct

Format your response as a JSON array with this exact structure:
[
    {
        "questionText": "Question text here?",
        "options": [
            {"text": "Option A text"},
            {"text": "Option B text"},
            {"text": "Option C text"},
            {"text": "Option D text"}
        ],
        "correctAnswer": 0
    }
]

Where correctAnswer is the index (0-3) of the correct option.
Make sure questions cover different aspects of the document and vary in difficulty.
Return ONLY the JSON array, no additional text.`;

            const response = await fetch('http://localhost:8000/retrieve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: query })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate questions');
            }

            const data = await response.json();
            
            // Parse the answer to extract JSON
            let questions;
            try {
                // Try to find JSON in the response
                const jsonMatch = data.answer.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    questions = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.error('Failed to parse questions:', parseError);
                throw new Error('Failed to parse generated questions. Please try again.');
            }

            // Validate questions format
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('No valid questions generated');
            }

            // Validate each question has required fields
            questions.forEach((q, index) => {
                if (!q.questionText || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
                    throw new Error(`Invalid format for question ${index + 1}`);
                }
            });

            return questions;
        } catch (err) {
            throw new Error(`Question generation failed: ${err.message}`);
        }
    };

    const createAssessmentInBackend = async (questions) => {
        try {
            const assessmentData = {
                heading: assessmentTitle || `AI Generated Assessment - ${new Date().toLocaleDateString()}`,
                topic: assessmentTopic || 'AI Generated from PDF',
                questions: questions
            };

            const response = await fetch('http://localhost:5000/api/assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(assessmentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create assessment');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            throw new Error(`Assessment creation failed: ${err.message}`);
        }
    };

    const handleGenerate = async () => {
        // Validation
        if (!pdfFile) {
            setError('Please upload a PDF file');
            return;
        }

        if (!assessmentTitle.trim()) {
            setError('Please enter an assessment title');
            return;
        }

        if (numQuestions < 1 || numQuestions > 20) {
            setError('Number of questions must be between 1 and 20');
            return;
        }

        setError('');
        setSuccess('');
        setGenerating(true);
        setStep(2);

        try {
            // Step 1: Upload PDF to RAG pipeline
            setSuccess('Uploading PDF to AI...');
            await uploadPdfToRag();

            // Step 2: Generate questions using RAG
            setSuccess('Analyzing document and generating questions...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX
            const questions = await generateQuestionsFromRag(numQuestions);

            // Step 3: Create assessment in backend
            setSuccess('Creating assessment...');
            await createAssessmentInBackend(questions);

            // Success!
            setStep(3);
            setSuccess(`Successfully generated ${questions.length} questions and created assessment!`);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/assignments/upload');
            }, 2000);

        } catch (err) {
            console.error('Generation error:', err);
            setError(err.message || 'Failed to generate assessment. Please try again.');
            setGenerating(false);
            setStep(1);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <ThemeToggle />

            {/* Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-lg shadow-sm border-b transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700'
                    : 'bg-white/80 border-gray-200'
            }`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/assignments/upload')}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                                theme === 'dark'
                                    ? 'hover:bg-gray-700'
                                    : 'hover:bg-gray-100'
                            }`}
                            disabled={generating}
                        >
                            <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={24} />
                                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    AI Assessment Generator
                                </h1>
                            </div>
                            <p className={`text-sm mt-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Upload a PDF and let AI generate questions automatically
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                        step >= s
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                            : theme === 'dark'
                                                ? 'bg-gray-700 text-gray-400'
                                                : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {step > s ? <CheckCircle size={20} /> : s}
                                    </div>
                                    <span className={`text-xs mt-1 font-medium ${
                                        step >= s
                                            ? theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                            : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                        {s === 1 ? 'Upload' : s === 2 ? 'Generate' : 'Complete'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                                        step > s
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                                            : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className={`mb-6 p-4 rounded-xl border-l-4 animate-fade-in ${
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

                {success && (
                    <div className={`mb-6 p-4 rounded-xl border-l-4 animate-fade-in ${
                        theme === 'dark'
                            ? 'bg-green-500/10 border-green-500 text-green-400'
                            : 'bg-green-50 border-green-500 text-green-700'
                    }`}>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            <p className="font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <div className={`rounded-2xl shadow-xl border overflow-hidden ${
                    theme === 'dark'
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-white border-gray-100'
                }`}>
                    <div className="p-6 space-y-6">
                        {/* Assessment Title */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Assessment Title *
                            </label>
                            <input
                                type="text"
                                value={assessmentTitle}
                                onChange={(e) => setAssessmentTitle(e.target.value)}
                                placeholder="e.g., Chapter 5 Quiz"
                                disabled={generating}
                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {/* Assessment Topic */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Topic (Optional)
                            </label>
                            <input
                                type="text"
                                value={assessmentTopic}
                                onChange={(e) => setAssessmentTopic(e.target.value)}
                                placeholder="e.g., Algebra Fundamentals"
                                disabled={generating}
                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Number of Questions (1-20) *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                disabled={generating}
                                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                                        : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            <p className={`text-xs mt-2 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                                AI will generate {numQuestions} multiple-choice questions from your PDF
                            </p>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Upload PDF Document *
                            </label>

                            {!pdfFile ? (
                                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                    generating
                                        ? 'opacity-50 cursor-not-allowed'
                                        : theme === 'dark'
                                            ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30 hover:bg-gray-700/50'
                                            : 'border-gray-300 hover:border-purple-500 bg-gray-50 hover:bg-gray-100'
                                }`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload size={48} className={`mb-4 ${
                                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`} />
                                        <p className={`mb-2 text-sm font-semibold ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Click to upload PDF
                                        </p>
                                        <p className={`text-xs ${
                                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                        }`}>
                                            PDF files only (Max 10MB)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
                                        disabled={generating}
                                    />
                                </label>
                            ) : (
                                <div className={`p-6 rounded-xl border-2 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700/50 border-gray-600'
                                        : 'bg-gray-50 border-gray-200'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${
                                                theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                                            }`}>
                                                <FileText size={24} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${
                                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {pdfPreview}
                                                </p>
                                                <p className={`text-sm ${
                                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveFile}
                                            disabled={generating}
                                            className={`p-2 rounded-lg transition-all duration-200 ${
                                                generating
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : theme === 'dark'
                                                        ? 'hover:bg-red-500/20 text-red-400'
                                                        : 'hover:bg-red-100 text-red-600'
                                            }`}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Box */}
                        <div className={`p-4 rounded-xl border-l-4 ${
                            theme === 'dark'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                : 'bg-blue-50 border-blue-500 text-blue-700'
                        }`}>
                            <div className="flex items-start gap-3">
                                <Brain size={20} className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold mb-1">How it works:</p>
                                    <ul className="text-xs space-y-1 list-disc list-inside">
                                        <li>Upload your study material PDF</li>
                                        <li>AI analyzes the content and extracts key concepts</li>
                                        <li>Multiple-choice questions are automatically generated</li>
                                        <li>Assessment is created and ready to assign to students</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating || !pdfFile || !assessmentTitle.trim()}
                            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                                generating || !pdfFile || !assessmentTitle.trim()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:scale-105'
                            } text-white`}
                        >
                            {generating ? (
                                <>
                                    <Loader className="animate-spin" size={24} />
                                    <span>Generating Questions...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    <span>Generate Assessment with AI</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {generating && (
                    <div className={`mt-6 p-6 rounded-2xl border ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-center">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className={`absolute inset-0 border-4 rounded-full ${
                                    theme === 'dark' ? 'border-purple-500/30' : 'border-purple-200'
                                }`}></div>
                                <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
                                    theme === 'dark' ? 'border-t-purple-500' : 'border-t-purple-600'
                                }`}></div>
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                AI is working on your assessment...
                            </h3>
                            <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                This may take a minute. Please don't close this page.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiAssessmentGeneration;