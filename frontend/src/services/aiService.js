/**
 * AI Service
 * Handles AI and OCR-related API calls to Python Flask backend
 */

import { aiApi } from './api';

const aiService = {
    // Upload handwritten question image for OCR
    uploadQuestionImage: async (imageFile) => {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await aiApi.post('/ocr/extract', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get AI explanation for a question
    getAIExplanation: async (question) => {
        try {
            const response = await aiApi.post('/ai/explain', { question });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Chat with AI assistant
    chatWithAI: async (message, conversationHistory = []) => {
        try {
            const response = await aiApi.post('/ai/chat', {
                message,
                history: conversationHistory,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get personalized recommendations
    getRecommendations: async (studentData) => {
        try {
            const response = await aiApi.post('/ai/recommendations', studentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Auto-generate notes from material
    generateNotes: async (materialId) => {
        try {
            const response = await aiApi.post('/ai/generate-notes', { materialId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Analyze performance and give insights
    analyzePerformance: async (studentId) => {
        try {
            const response = await aiApi.get(`/ai/performance/${studentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default aiService;