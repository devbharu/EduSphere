/**
 * PublicRoute - Route wrapper for public pages
 * Redirects to dashboard if user is already authenticated
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    // If user is authenticated, redirect to appropriate dashboard
    if (isAuthenticated) {
        if (user?.role === 'teacher') {
            return <Navigate to="/teacher/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    // Render the public page (login, register, etc.)
    return children;
};

export default PublicRoute;