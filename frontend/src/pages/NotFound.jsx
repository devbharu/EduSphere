/**
 * NotFound - 404 Error Page
 * Displayed when user navigates to non-existent route
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="text-center">
                {/* 404 Animation */}
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary-600">404</h1>
                    <div className="text-6xl mb-4">📚</div>
                </div>

                {/* Error Message */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Home size={20} />
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;