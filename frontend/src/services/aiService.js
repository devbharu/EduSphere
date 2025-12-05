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

    // Text-to-Speech inline
    ttsInline: async (text, language = null) => {
        const res = await fetch('http://localhost:8000/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language, inline: true }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'TTS request failed' }));
            throw new Error(err.error || 'TTS request failed');
        }

        const data = await res.json();

        // If server returned base64 audio, convert to object URL
        if (data.audio_base64) {
            const binary = atob(data.audio_base64);
            const len = binary.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            return { url, detected_language: data.detected_language, text: data.text, audio_url: data.audio_url };
        }

        // fallback: return server audio URL
        return { url: `http://localhost:8000${data.audio_url}`, detected_language: data.detected_language, text: data.text };
    },
};

export default aiService;