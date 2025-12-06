import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit,
    Eye,
    Upload,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Users,
    Award,
    BookOpen,
    TrendingUp
} from 'lucide-react';
import ThemeToggle from '../../../components/ThemeToggle';

const UploadAssessment = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [studentResults, setStudentResults] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        heading: '',
        topic: '',
        questions: [
            {
                questionText: '',
                options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                correctAnswer: 0
            }
        ]
    });

    useEffect(() => {
        loadAssessments();
    }, []);

    const loadAssessments = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('http://localhost:5000/api/assessments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch assessments');
            }

            const data = await response.json();
            setAssessments(data.assessments || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load assessments:', err);
            setError('Failed to load assessments. Please try again.');
            setLoading(false);
        }
    };

    const loadStudentResults = async (assessmentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/assessment-users/assessment/${assessmentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            // console.log(data.records)
            setStudentResults(data.records || []);
        } catch (err) {
            console.error('Failed to load student results:', err);
            setStudentResults([]);
        }
    };

    const handleCreateAssessment = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.heading.trim() || !formData.topic.trim()) {
            setError('Heading and topic are required');
            return;
        }

        if (formData.questions.length === 0) {
            setError('At least one question is required');
            return;
        }

        for (let i = 0; i < formData.questions.length; i++) {
            const q = formData.questions[i];
            if (!q.questionText.trim()) {
                setError(`Question ${i + 1} text is required`);
                return;
            }
            if (q.options.some(opt => !opt.text.trim())) {
                setError(`All options for question ${i + 1} are required`);
                return;
            }
        }

        try {
            setSubmitting(true);
            setError('');

            const response = await fetch('http://localhost:5000/api/assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create assessment');
            }

            await loadAssessments();
            setShowCreateModal(false);
            resetForm();
            setSubmitting(false);
        } catch (err) {
            console.error('Failed to create assessment:', err);
            setError(err.message || 'Failed to create assessment. Please try again.');
            setSubmitting(false);
        }
    };

    const handleDeleteAssessment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assessment?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/assessments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete assessment');
            }

            await loadAssessments();
        } catch (err) {
            console.error('Failed to delete assessment:', err);
            setError('Failed to delete assessment. Please try again.');
        }
    };

    const handleViewDetails = async (assessment) => {
        setSelectedAssessment(assessment);
        // console.log(assessment._id)
        await loadStudentResults(assessment._id);
        setShowDetailsModal(true);
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    questionText: '',
                    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                    correctAnswer: 0
                }
            ]
        });
    };

    const removeQuestion = (index) => {
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex].text = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const resetForm = () => {
        setFormData({
            heading: '',
            topic: '',
            questions: [
                {
                    questionText: '',
                    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                    correctAnswer: 0
                }
            ]
        });
        setError('');
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className={`absolute inset-0 border-4 rounded-full ${
                            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                        }`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
                            theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                        }`}></div>
                    </div>
                    <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading assessments...
                    </p>
                </div>
            </div>
        );
    }

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/assignments')}
                                className={`p-2.5 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                            </button>
                            <div>
                                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Manage Assessments
                                </h1>
                                <p className={`text-sm mt-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    Create and manage student assessments
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                        >
                            <Plus size={20} />
                            <span>Create Assessment</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                {/* Assessments Grid */}
                {assessments.length === 0 ? (
                    <div className={`text-center py-16 rounded-2xl border ${
                        theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-white border-gray-200'
                    }`}>
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <BookOpen size={40} className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            No Assessments Yet
                        </h3>
                        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Create your first assessment to get started
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Create Assessment
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {assessments.map((assessment) => (
                            <div
                                key={assessment._id}
                                className={`rounded-2xl shadow-lg border p-6 transition-all duration-300 hover:shadow-xl ${
                                    theme === 'dark'
                                        ? 'bg-gray-800/50 border-gray-700'
                                        : 'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {assessment.heading}
                                        </h3>
                                        <p className={`text-sm font-semibold ${
                                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                        }`}>
                                            {assessment.topic}
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-4 text-sm mb-5 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    <span className="flex items-center gap-1">
                                        <BookOpen size={16} />
                                        {assessment.questions?.length || 0} Questions
                                    </span>
                                </div>

                                <div className={`flex items-center gap-2 pt-4 border-t ${
                                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    <button
                                        onClick={() => handleViewDetails(assessment)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                            theme === 'dark'
                                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                        }`}
                                    >
                                        <Eye size={16} />
                                        <span>View Details</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAssessment(assessment._id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                            theme === 'dark'
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                        }`}
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Assessment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h2 className={`text-2xl font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Create New Assessment
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <X size={24} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAssessment} className="p-6 space-y-6">
                            {/* Heading */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Assessment Heading *
                                </label>
                                <input
                                    type="text"
                                    value={formData.heading}
                                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                    }`}
                                    placeholder="e.g., Algebra Fundamentals"
                                    required
                                />
                            </div>

                            {/* Topic */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    Topic *
                                </label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                    }`}
                                    placeholder="e.g., Linear Equations"
                                    required
                                />
                            </div>

                            {/* Questions */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className={`text-sm font-medium ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        Questions *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                                    >
                                        <Plus size={16} />
                                        Add Question
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {formData.questions.map((question, qIndex) => (
                                        <div
                                            key={qIndex}
                                            className={`p-4 rounded-xl border ${
                                                theme === 'dark'
                                                    ? 'bg-gray-700/50 border-gray-600'
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <span className={`text-sm font-semibold ${
                                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Question {qIndex + 1}
                                                </span>
                                                {formData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        className={`p-1 rounded-lg transition-all duration-200 ${
                                                            theme === 'dark'
                                                                ? 'hover:bg-red-500/20 text-red-400'
                                                                : 'hover:bg-red-100 text-red-600'
                                                        }`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <input
                                                type="text"
                                                value={question.questionText}
                                                onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-xl mb-4 transition-all duration-200 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                                }`}
                                                placeholder="Enter question text"
                                                required
                                            />

                                            <div className="space-y-2">
                                                {question.options.map((option, oIndex) => (
                                                    <div key={oIndex} className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name={`question-${qIndex}`}
                                                            checked={question.correctAnswer === oIndex}
                                                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                            className="w-5 h-5 text-green-600"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                            className={`flex-1 px-4 py-2 border rounded-xl transition-all duration-200 ${
                                                                theme === 'dark'
                                                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                                                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                                            }`}
                                                            placeholder={`Option ${oIndex + 1}`}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        theme === 'dark'
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Create Assessment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedAssessment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}>
                        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <div>
                                <h2 className={`text-2xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    {selectedAssessment.heading}
                                </h2>
                                <p className={`text-sm ${
                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                }`}>
                                    {selectedAssessment.topic}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedAssessment(null);
                                    setStudentResults([]);
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <X size={24} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className={`p-4 rounded-xl ${
                                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users size={20} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                        <span className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Students Attempted
                                        </span>
                                    </div>
                                    <p className={`text-2xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {studentResults.length}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${
                                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={20} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                                        <span className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Average Score
                                        </span>
                                    </div>
                                    <p className={`text-2xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {studentResults.length > 0
                                            ? Math.round(studentResults.reduce((sum, r) => sum + r.marks, 0) / studentResults.length)
                                            : 0}%
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${
                                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen size={20} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                        <span className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                            Total Questions
                                        </span>
                                    </div>
                                    <p className={`text-2xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        {selectedAssessment.questions?.length || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Student Results Table */}
                            <h3 className={`text-lg font-bold mb-4 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                Student Results
                            </h3>

                            {studentResults.length === 0 ? (
                                <div className={`text-center py-12 rounded-xl ${
                                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                                }`}>
                                    <Users size={48} className={`mx-auto mb-4 ${
                                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                    }`} />
                                    <p className={`font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        No students have attempted this assessment yet
                                    </p>
                                </div>
                            ) : (
                                <div className={`overflow-x-auto rounded-xl border ${
                                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                    <table className="w-full">
                                        <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                                            <tr>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Student ID
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Score
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    Submitted At
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${
                                            theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                                        }`}>
                                            {studentResults.map((result, index) => (
                                                <tr key={index} className={theme === 'dark' ? 'bg-gray-800' : 'bg-white'}>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                                                    }`}>
                                                        {result.studentId?._id || result.studentId}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Award size={16} className={
                                                                result.marks >= 80 ? 'text-green-500' :
                                                                result.marks >= 60 ? 'text-yellow-500' : 'text-red-500'
                                                            } />
                                                            <span className={`text-sm font-bold ${
                                                                result.marks >= 80 ? 'text-green-500' :
                                                                result.marks >= 60 ? 'text-yellow-500' : 'text-red-500'
                                                            }`}>
                                                                {result.marks}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                    }`}>
                                                        {new Date(result.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadAssessment;