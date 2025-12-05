import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    ArrowLeft,
    FileText,
    Video,
    BookOpen,
    Download,
    Search,
    Folder,
    Play,
    FileDown,
    Eye,
    Clock,
    Calendar
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const Materials = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = () => {
        setTimeout(() => {
            setMaterials([
                {
                    id: 1,
                    title: 'Introduction to Calculus',
                    subject: 'Mathematics',
                    type: 'pdf',
                    size: '2.5 MB',
                    uploadDate: '2024-03-01',
                    description: 'Complete notes on calculus fundamentals',
                    url: '/materials/calculus.pdf',
                    views: 245,
                    downloads: 89
                },
                {
                    id: 2,
                    title: 'Physics Lecture - Newton\'s Laws',
                    subject: 'Physics',
                    type: 'video',
                    size: '45 MB',
                    duration: '25:30',
                    uploadDate: '2024-03-02',
                    description: 'Video lecture explaining Newton\'s three laws',
                    url: '/materials/physics-lecture.mp4',
                    views: 312,
                    downloads: 0
                },
                {
                    id: 3,
                    title: 'Organic Chemistry Notes',
                    subject: 'Chemistry',
                    type: 'pdf',
                    size: '3.2 MB',
                    uploadDate: '2024-03-03',
                    description: 'Comprehensive notes on organic chemistry',
                    url: '/materials/organic-chem.pdf',
                    views: 189,
                    downloads: 67
                },
                {
                    id: 4,
                    title: 'Data Structures Tutorial',
                    subject: 'Computer Science',
                    type: 'video',
                    size: '120 MB',
                    duration: '45:00',
                    uploadDate: '2024-03-04',
                    description: 'Complete tutorial on data structures',
                    url: '/materials/ds-tutorial.mp4',
                    views: 421,
                    downloads: 0
                },
                {
                    id: 5,
                    title: 'Linear Algebra Study Guide',
                    subject: 'Mathematics',
                    type: 'notes',
                    size: '1.8 MB',
                    uploadDate: '2024-03-05',
                    description: 'Quick reference guide for linear algebra',
                    url: '/materials/linear-algebra.pdf',
                    views: 156,
                    downloads: 45
                },
            ]);
            setLoading(false);
        }, 1000);
    };

    const subjects = ['all', ...new Set(materials.map(m => m.subject))];

    const filteredMaterials = materials.filter(material => {
        const matchesFilter = filter === 'all' || material.type === filter;
        const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
        const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.subject.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSubject && matchesSearch;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf':
                return <FileText size={28} />;
            case 'video':
                return <Video size={28} />;
            case 'notes':
                return <BookOpen size={28} />;
            default:
                return <FileText size={28} />;
        }
    };

    const getTypeBadge = (type) => {
        const styles = {
            pdf: {
                dark: 'bg-red-500/20 text-red-400 border-red-500/30',
                light: 'bg-red-50 text-red-700 border-red-200'
            },
            video: {
                dark: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                light: 'bg-purple-50 text-purple-700 border-purple-200'
            },
            notes: {
                dark: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                light: 'bg-blue-50 text-blue-700 border-blue-200'
            },
        };
        const style = styles[type][theme];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${style}`}>
                {type.toUpperCase()}
            </span>
        );
    };

    const getTypeColor = (type) => {
        const colors = {
            pdf: theme === 'dark' ? 'text-red-400' : 'text-red-600',
            video: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
            notes: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        };
        return colors[type];
    };

    const handleDownload = (material) => {
        alert(`Downloading: ${material.title}`);
    };

    const handleView = (material) => {
        alert(`Opening: ${material.title}`);
    };

    const stats = {
        total: materials.length,
        pdfs: materials.filter(m => m.type === 'pdf').length,
        videos: materials.filter(m => m.type === 'video').length,
        notes: materials.filter(m => m.type === 'notes').length,
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className={`absolute inset-0 border-4 rounded-full ${
                            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                        }`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
                            theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                        }`}></div>
                    </div>
                    <p className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading study materials...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Theme Toggle Component */}
            <ThemeToggle />

            {/* Header */}
            <div className={`sticky top-0 z-40 backdrop-blur-lg shadow-sm border-b transition-colors duration-300 ${
                theme === 'dark'
                    ? 'bg-gray-800/95 border-gray-700'
                    : 'bg-white/80 border-gray-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                                theme === 'dark'
                                    ? 'hover:bg-gray-700'
                                    : 'hover:bg-gray-100'
                            }`}
                            aria-label="Back to Dashboard"
                        >
                            <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                        </button>
                        <div className="flex-1">
                            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                                <div className={`p-2 rounded-xl ${
                                    theme === 'dark'
                                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                                        : 'bg-gradient-to-br from-blue-100 to-purple-100'
                                }`}>
                                    <Folder size={24} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                </div>
                                Study Materials
                            </h1>
                            <p className={`text-sm mt-1 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Access your learning resources and course materials
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className={`p-4 rounded-xl border transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700/50 border-gray-600'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                                }`}>
                                    <Folder size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                </div>
                                <div>
                                    <p className={`text-xs font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Total</p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700/50 border-gray-600'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                                }`}>
                                    <FileText size={18} className={theme === 'dark' ? 'text-red-400' : 'text-red-600'} />
                                </div>
                                <div>
                                    <p className={`text-xs font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>PDFs</p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{stats.pdfs}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700/50 border-gray-600'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                                }`}>
                                    <Video size={18} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                </div>
                                <div>
                                    <p className={`text-xs font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Videos</p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{stats.videos}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700/50 border-gray-600'
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                                }`}>
                                    <BookOpen size={18} className={theme === 'dark' ? 'text-green-400' : 'text-green-600'} />
                                </div>
                                <div>
                                    <p className={`text-xs font-medium ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>Notes</p>
                                    <p className={`text-xl font-bold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{stats.notes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`} size={18} />
                            <input
                                type="text"
                                placeholder="Search by title or subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                }`}
                            />
                        </div>

                        {/* Subject Filter */}
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className={`px-4 py-3 border-2 rounded-xl transition-all duration-200 font-medium ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                            }`}
                        >
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject === 'all' ? 'All Subjects' : subject}
                                </option>
                            ))}
                        </select>

                        {/* Type Filter Buttons */}
                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                            {['all', 'pdf', 'video', 'notes'].map((filterType) => (
                                <button
                                    key={filterType}
                                    onClick={() => setFilter(filterType)}
                                    className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                                        filter === filterType
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : theme === 'dark'
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {filterType === 'all' ? 'All' : filterType === 'pdf' ? 'PDFs' : filterType === 'video' ? 'Videos' : 'Notes'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredMaterials.length === 0 ? (
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
                            No Materials Found
                        </h3>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                            {searchQuery ? 'Try adjusting your search or filters' : 'Check back later for new materials'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.map((material) => (
                            <div
                                key={material.id}
                                className={`rounded-2xl shadow-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                                    theme === 'dark'
                                        ? 'bg-gray-800/50 border-gray-700'
                                        : 'bg-white border-gray-100'
                                }`}
                            >
                                {/* Material Icon Header */}
                                <div className={`relative p-8 flex items-center justify-center ${
                                    theme === 'dark'
                                        ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                                        : 'bg-gradient-to-br from-gray-50 to-gray-100'
                                }`}>
                                    <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl ${
                                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                                    }`}>
                                        <div className={getTypeColor(material.type)}>
                                            {getTypeIcon(material.type)}
                                        </div>
                                    </div>
                                </div>

                                {/* Material Info */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className={`text-lg font-bold flex-1 line-clamp-2 ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>
                                            {material.title}
                                        </h3>
                                    </div>

                                    {getTypeBadge(material.type)}

                                    <p className={`text-sm font-semibold mt-3 mb-2 ${
                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    }`}>
                                        {material.subject}
                                    </p>

                                    <p className={`text-sm mb-4 line-clamp-2 ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                        {material.description}
                                    </p>

                                    {/* Material Stats */}
                                    <div className={`flex items-center gap-4 mb-4 pb-4 border-b text-xs ${
                                        theme === 'dark' ? 'text-gray-500 border-gray-700' : 'text-gray-500 border-gray-200'
                                    }`}>
                                        <div className="flex items-center gap-1.5">
                                            <FileDown size={14} />
                                            <span>{material.size}</span>
                                        </div>
                                        {material.duration && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>{material.duration}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Eye size={14} />
                                            <span>{material.views}</span>
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between mb-4 text-xs ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                    }`}>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(material.uploadDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleView(material)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                                                material.type === 'video'
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                            }`}
                                        >
                                            {material.type === 'video' ? (
                                                <>
                                                    <Play size={16} />
                                                    <span>Play</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={16} />
                                                    <span>View</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDownload(material)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                                                theme === 'dark'
                                                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                            }`}
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Materials;