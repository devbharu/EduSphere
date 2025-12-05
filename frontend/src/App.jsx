/**
 * App Component - Main application component
 * Handles routing and global layout
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import route components
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student pages
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Assignments from './pages/student/Assignments';
import Materials from './pages/student/Materials';
import LiveClass from './pages/student/Liveclass';
import Chat from './pages/student/Chat';
import DoubtAssistant from './pages/student/DoubtAssistant';


// 404 page
import NotFound from './pages/NotFound';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="spinner mx-auto mb-4"></div>
      <p className="text-gray-600">Loading EduSphere...</p>
    </div>
  </div>
);

function App() {
  const { loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes - Redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Student Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <PrivateRoute>
              <Assignments />
            </PrivateRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <PrivateRoute>
              <Materials />
            </PrivateRoute>
          }
        />
        <Route
          path="/live-class/:classId"
          element={
            <PrivateRoute>
              <LiveClass />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/doubt-assistant"
          element={
            <PrivateRoute>
              <DoubtAssistant />
            </PrivateRoute>
          }
        />

        {/* Teacher Private Routes */}


        {/* Default route - redirect to dashboard or login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;