/**
 * App Component - Main application component
 * Handles routing, global layout, and context wrapping for EduSphere.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Context Providers
import { SocketProvider } from './context/SocketContext';
import { WebRTCProvider } from './context/WebRTCContext';

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
import LiveClass from './pages/student/Liveclass'; // Component using useWebRTCCall
import Chat from './pages/student/Chat';
import DoubtAssistant from './pages/student/DoubtAssistant';
import StartUpFundRiser from './pages/student/StartUpFundRiser';
import DocsList from './pages/student/Doclist';
import DocEditor from './pages/student/DocEditor';

// Assessment pages (Used by both roles)
import AssessmentQuiz from './pages/student/AssignmentAssessment/AssessmentQuiz';
import UploadAssessment from './pages/student/AssignmentAssessment/UploadAssessment';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';

// Investor pages
import InvestorDashboard from './pages/investor/Dashboard';

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

  // SocketProvider must wrap WebRTCProvider for context dependency
  return (
    <div className="App">
      <SocketProvider>
        <WebRTCProvider>
          <Routes>
            {/* Public Routes */}
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

            {/* --- Shared & Student Private Routes --- */}

            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={['student', 'teacher', 'investor']}>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Assignments (Accessible by both Student and Teacher) */}
            <Route
              path="/assignments"
              element={
                <PrivateRoute allowedRoles={['student', 'teacher']}>
                  <Assignments />
                </PrivateRoute>
              }
            />

            {/* Live Class */}
            <Route
              path="/live-class/:classId"
              element={
                <PrivateRoute allowedRoles={['student', 'teacher']}>
                  <LiveClass />
                </PrivateRoute>
              }
            />

            {/* Assessment Routes */}
            <Route
              path="/assignments/upload"
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <UploadAssessment />
                </PrivateRoute>
              }
            />
            <Route
              path="/assessment/:assessmentId"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <AssessmentQuiz />
                </PrivateRoute>
              }
            />

            {/* Other Student Routes */}
            <Route
              path="/materials"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <Materials />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/doubt-assistant"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <DoubtAssistant />
                </PrivateRoute>
              }
            />
            <Route
              path="/startUp-fundRiser"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <StartUpFundRiser />
                </PrivateRoute>
              }
            />

            {/* Docs Routes */}
            <Route
              path="/docs"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <DocsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/docs/:id"
              element={
                <PrivateRoute allowedRoles={['student']}>
                  <DocEditor />
                </PrivateRoute>
              }
            />

            {/* --- Teacher Private Routes --- */}
            <Route
              path="/teacher/dashboard"
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/teacher/assessments"
              element={
                <PrivateRoute allowedRoles={['teacher']}>
                  {/* Assuming teacher uses UploadAssessment for managing assessments */}
                  <UploadAssessment />
                </PrivateRoute>
              }
            />

            {/* --- Investor Private Routes --- */}
            <Route
              path="/investor/dashboard"
              element={
                <PrivateRoute allowedRoles={['investor']}>
                  <InvestorDashboard />
                </PrivateRoute>
              }
            />

            {/* Default route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WebRTCProvider>
      </SocketProvider>
    </div>
  );
}

export default App;