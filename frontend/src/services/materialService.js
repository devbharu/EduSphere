/**
 * Material Service
 * Handles study materials (PDFs, videos, notes) API calls
 */

import api from './api';

const materialService = {
    // Get all study materials
    getMaterials: async (filters = {}) => {
        try {
            const response = await api.get('/materials', { params: filters });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get materials by subject/class
    getMaterialsBySubject: async (subjectId) => {
        try {
            const response = await api.get(`/materials/subject/${subjectId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get single material details
    getMaterialById: async (id) => {
        try {
            const response = await api.get(`/materials/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Download material
    downloadMaterial: async (id) => {
        try {
            const response = await api.get(`/materials/${id}/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Upload material (Teacher only)
    uploadMaterial: async (formData) => {
        try {
            const response = await api.post('/materials/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update material (Teacher only)
    updateMaterial: async (id, materialData) => {
        try {
            const response = await api.put(`/materials/${id}`, materialData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Delete material (Teacher only)
    deleteMaterial: async (id) => {
        try {
            const response = await api.delete(`/materials/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get recent materials
    getRecentMaterials: async () => {
        try {
            const response = await api.get('/materials/recent');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default materialService;