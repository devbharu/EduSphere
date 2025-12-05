/**
 * Materials Page - Study materials library
 * View PDFs, videos, and notes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Video,
    BookOpen,
    Download,
    Search,
    Filter,
    Eye
} from 'lucide-react';
import materialService from '../../services/materialService';

const Materials = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pdf, video, notes
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
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
                    },
                ]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to load materials:', error);
            setLoading(false);
        }
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
                return <FileText className="text-red-600" size={24} />;
            case 'video':
                return <Video className="text-purple-600" size={24} />;
            case 'notes':
                return <BookOpen className="text-blue-600" size={24} />;
            default:
                return <FileText className="text-gray-600" size={24} />;
        }
    };

    const getTypeBadge = (type) => {
        const colors = {
            pdf: 'bg-red-100 text-red-800',
            video: 'bg-purple-100 text-purple-800',
            notes: 'bg-blue-100 text-blue-800',
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
                {type.toUpperCase()}
            </span>
        );
    };

    const handleDownload = async (material) => {
        try {
            // TODO: Implement actual download
            alert(`Downloading: ${material.title}`);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleView = (material) => {
        // TODO: Open material in viewer/modal
        alert(`Opening: ${material.title}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
                            <p className="text-gray-600 text-sm">Access your learning resources</p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search materials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {/* Subject Filter */}
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>
                                    {subject === 'all' ? 'All Subjects' : subject}
                                </option>
                            ))}
                        </select>

                        {/* Type Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pdf')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pdf'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                PDFs
                            </button>
                            <button
                                onClick={() => setFilter('video')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'video'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Videos
                            </button>
                            <button
                                onClick={() => setFilter('notes')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'notes'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Notes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredMaterials.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No materials found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.map((material) => (
                            <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Material Icon Header */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                                        {getTypeIcon(material.type)}
                                    </div>
                                </div>

                                {/* Material Info */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 flex-1">{material.title}</h3>
                                        {getTypeBadge(material.type)}
                                    </div>

                                    <p className="text-sm text-primary-600 font-medium mb-2">{material.subject}</p>
                                    <p className="text-sm text-gray-600 mb-4">{material.description}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span>{material.size}</span>
                                        {material.duration && <span>{material.duration}</span>}
                                        <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleView(material)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(material)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
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