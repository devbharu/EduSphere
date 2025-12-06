import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertCircle,
    Send,
    Loader,
    Award,
    Target,
    BookOpen
} from 'lucide-react';
import ThemeToggle from '../../../components/ThemeToggle';

const AssessmentQuiz = () => {
    const navigate = useNavigate();
    const { assessmentId } = useParams();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [quizStarted, setQuizStarted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadAssessment();
    }, [assessmentId]);

    useEffect(() => {
        if (quizStarted && timeLeft > 0 && !showResults) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [quizStarted, timeLeft, showResults]);

    const loadAssessment = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load assessment');
            }

            const data = await response.json();
            
            if (data.success && data.assesment) {
                setAssessment(data.assesment);
            } else {
                throw new Error('Invalid assessment data');
            }

            setLoading(false);
        } catch (err) {
            console.error('Failed to load assessment:', err);
            setError(err.message || 'Failed to load assessment. Please try again.');
            setLoading(false);
        }
    };

    const handleStartQuiz = () => {
        setQuizStarted(true);
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: optionIndex
        });
    };

    const calculateScore = () => {
        let correct = 0;
        assessment.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correct++;
            }
        });
        const percentage = Math.round((correct / assessment.questions.length) * 100);
        return percentage;
    };

    const handleAutoSubmit = async () => {
        await handleSubmit(true);
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (!autoSubmit) {
            const unanswered = assessment.questions.length - Object.keys(selectedAnswers).length;
            if (unanswered > 0) {
                const confirmed = window.confirm(
                    `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`
                );
                if (!confirmed) return;
            }
        }

        try {
            setSubmitting(true);
            setError('');

            const calculatedScore = calculateScore();
            setScore(calculatedScore);

            // Submit to backend
            const response = await fetch('http://localhost:5000/api/assessment-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    assesmentId: assessmentId,
                    studentId: user._id,
                    marks: calculatedScore
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit assessment');
            }

            const data = await response.json();
            console.log('Assessment submitted successfully:', data);

            setShowResults(true);
            setSubmitting(false);
        } catch (err) {
            console.error('Failed to submit assessment:', err);
            setError(err.message || 'Failed to submit assessment. Please try again.');
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100';
        if (score >= 60) return theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100';
        return theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100';
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <Loader className={`mx-auto mb-4 animate-spin ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} size={48} />
                    <p className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading assessment...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !assessment) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className={`text-center p-8 rounded-2xl border ${
                    theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                }`}>
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        Error Loading Assessment
                    </h3>
                    <p className={`mb-4 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        {error}
                    </p>
                    <button
                        onClick={() => navigate('/assignments')}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                        Back to Assessments
                    </button>
                </div>
            </div>
        );
    }

    // Results Screen
    if (showResults) {
        return (
            <div className={`min-h-screen ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <ThemeToggle />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className={`rounded-2xl border shadow-xl p-8 text-center ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                            getScoreBgColor(score)
                        }`}>
                            <Award size={48} className={getScoreColor(score)} />
                        </div>

                        <h2 className={`text-3xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            Assessment Completed!
                        </h2>

                        <p className={`text-lg mb-8 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                            {assessment.heading}
                        </p>

                        <div className={`inline-block px-8 py-4 rounded-2xl mb-8 ${
                            getScoreBgColor(score)
                        }`}>
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Your Score
                            </p>
                            <p className={`text-5xl font-bold ${getScoreColor(score)}`}>
                                {score}%
                            </p>
                        </div>

                        <div className={`grid grid-cols-3 gap-4 mb-8 p-6 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                            <div>
                                <p className={`text-sm font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Total Questions
                                </p>
                                <p className={`text-2xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {assessment.questions.length}
                                </p>
                            </div>
                            <div>
                                <p className={`text-sm font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Correct Answers
                                </p>
                                <p className={`text-2xl font-bold text-green-500`}>
                                    {Math.round((score / 100) * assessment.questions.length)}
                                </p>
                            </div>
                            <div>
                                <p className={`text-sm font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Wrong Answers
                                </p>
                                <p className={`text-2xl font-bold text-red-500`}>
                                    {assessment.questions.length - Math.round((score / 100) * assessment.questions.length)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/assignments')}
                            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Back to Assessments
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Start Screen
    if (!quizStarted) {
        return (
            <div className={`min-h-screen ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <ThemeToggle />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button
                        onClick={() => navigate('/assignments')}
                        className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-xl transition-all duration-200 ${
                            theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>

                    <div className={`rounded-2xl border shadow-xl p-8 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                            theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                        }`}>
                            <BookOpen size={32} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                        </div>

                        <h1 className={`text-3xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            {assessment.heading}
                        </h1>

                        <p className={`text-lg mb-8 ${
                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                            {assessment.topic}
                        </p>

                        <div className={`grid grid-cols-2 gap-4 mb-8 p-6 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                            <div className="flex items-center gap-3">
                                <Target className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
                                <div>
                                    <p className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Total Questions
                                    </p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {assessment.questions.length}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className={theme === 'dark' ? 'text-orange-400' : 'text-orange-600'} size={24} />
                                <div>
                                    <p className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        Time Limit
                                    </p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        30 minutes
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl mb-8 border-l-4 ${
                            theme === 'dark'
                                ? 'bg-blue-500/10 border-blue-500'
                                : 'bg-blue-50 border-blue-500'
                        }`}>
                            <h3 className={`font-semibold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Instructions:
                            </h3>
                            <ul className={`space-y-1 text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                <li>• Read each question carefully before selecting an answer</li>
                                <li>• You can change your answers before submitting</li>
                                <li>• Assessment will auto-submit when time runs out</li>
                                <li>• Once submitted, you cannot retake this assessment</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleStartQuiz}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200"
                        >
                            Start Assessment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Screen
    return (
        <div className={`min-h-screen ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <ThemeToggle />

            {/* Timer Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-lg shadow-sm border-b ${
                theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700'
                    : 'bg-white/80 border-gray-200'
            }`}>
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                {assessment.heading}
                            </h2>
                            <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {Object.keys(selectedAnswers).length} of {assessment.questions.length} answered
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                            timeLeft < 300
                                ? 'bg-red-500/20 text-red-500'
                                : theme === 'dark'
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 text-gray-700'
                        }`}>
                            <Clock size={20} />
                            <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className={`mb-6 p-4 rounded-xl border-l-4 ${
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

                <div className="space-y-6 mb-8">
                    {assessment.questions.map((question, qIndex) => (
                        <div
                            key={qIndex}
                            className={`rounded-2xl border shadow-sm p-6 ${
                                theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                            }`}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                                    selectedAnswers[qIndex] !== undefined
                                        ? 'bg-green-500 text-white'
                                        : theme === 'dark'
                                            ? 'bg-gray-700 text-gray-300'
                                            : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {qIndex + 1}
                                </div>
                                <p className={`flex-1 text-lg font-medium ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {question.questionText}
                                </p>
                            </div>

                            <div className="space-y-3 ml-12">
                                {question.options.map((option, oIndex) => (
                                    <button
                                        key={oIndex}
                                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                            selectedAnswers[qIndex] === oIndex
                                                ? 'border-green-500 bg-green-500/10'
                                                : theme === 'dark'
                                                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                selectedAnswers[qIndex] === oIndex
                                                    ? 'border-green-500 bg-green-500'
                                                    : theme === 'dark'
                                                        ? 'border-gray-500'
                                                        : 'border-gray-300'
                                            }`}>
                                                {selectedAnswers[qIndex] === oIndex && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                            <span className={`font-medium ${
                                                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                            }`}>
                                                {option.text}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className={`sticky bottom-0 p-4 rounded-2xl shadow-xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Assessment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentQuiz;