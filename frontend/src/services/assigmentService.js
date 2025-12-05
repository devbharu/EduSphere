/**
 * Assignment Service
 * Handles all assignment-related API calls
 */

import api from './api';

const assignmentService = {
    // Get all assignments for student
    getAssignments: async (filters = {}) => {
        try {
            const response = await api.get('/assignments', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get single assignment details
    getAssignmentById: async (id) => {
        try {
            const response = await api.get(`/assignments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Submit assignment
    submitAssignment: async (assignmentId, formData) => {
        try {
            const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get assignment submission status
    getSubmissionStatus: async (assignmentId) => {
        try {
            const response = await api.get(`/assignments/${assignmentId}/submission`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get upcoming deadlines
    getUpcomingDeadlines: async () => {
        try {
            const response = await api.get('/assignments/deadlines/upcoming');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create assignment (Teacher only)
    createAssignment: async (assignmentData) => {
        try {
            const response = await api.post('/assignments', assignmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update assignment (Teacher only)
    updateAssignment: async (id, assignmentData) => {
        try {
            const response = await api.put(`/assignments/${id}`, assignmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete assignment (Teacher only)
    deleteAssignment: async (id) => {
        try {
            const response = await api.delete(`/assignments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Grade assignment (Teacher only)
    gradeAssignment: async (submissionId, gradeData) => {
        try {
            const response = await api.post(`/assignments/submissions/${submissionId}/grade`, gradeData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default assignmentService;