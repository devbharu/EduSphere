/**
 * AuthContext - Manages authentication state AND Document State globally
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // --- New State for Docs ---
    const [docs, setDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);

    // Check if user is already logged in (on app load)
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Check authentication status from localStorage or server
    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
                // Set default authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // --- Document Management Functions ---

    // Fetch all docs for the current user
    const fetchDocs = async () => {
        setDocsLoading(true);
        try {
            // Adjust endpoint if needed (e.g., /student/docs or /docs/my-docs)
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/docs`);

            // Handle different API response structures ( { data: [] } vs [ ] )
            const docsData = response.data.data || response.data.docs || response.data;

            if (Array.isArray(docsData)) {
                setDocs(docsData);
            } else {
                setDocs([]);
                console.warn("API returned non-array for docs:", docsData);
            }
        } catch (error) {
            console.error("Failed to fetch docs:", error);
        } finally {
            setDocsLoading(false);
        }
    };

    // Delete a doc
    const deleteDoc = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/docs/${id}`);
            // Optimistic update: remove from state immediately
            setDocs((prevDocs) => prevDocs.filter((doc) => doc._id !== id));
            return true;
        } catch (error) {
            console.error("Failed to delete doc:", error);
            return false;
        }
    };

    // Automatically fetch docs when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchDocs();
        } else {
            setDocs([]); // Clear docs on logout
        }
    }, [isAuthenticated]);

    // --- Auth Functions ---

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                email,
                password,
            });

            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, userData);
            const { token, user: newUser } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(newUser);
            setIsAuthenticated(true);

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        setDocs([]); // Clear sensitive data
    };

    // Update user profile
    const updateUser = (updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateUser,
        // Docs values exposed here
        docs,
        docsLoading,
        fetchDocs,
        deleteDoc
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Export useUser as an alias for useAuth to match DocsList imports
export const useUser = useAuth;

export default AuthContext;