/**
 * Chat Service
 * Handles chat and messaging API calls
 */

import api from './api';

const chatService = {
    // Get all chat rooms/classes
    getChatRooms: async () => {
        try {
            const response = await api.get('/chat/rooms');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get messages for a specific room
    getMessages: async (roomId, limit = 50, offset = 0) => {
        try {
            const response = await api.get(`/chat/rooms/${roomId}/messages`, {
                params: { limit, offset },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Send a message
    sendMessage: async (roomId, messageData) => {
        try {
            const response = await api.post(`/chat/rooms/${roomId}/messages`, messageData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Upload file in chat
    uploadFile: async (roomId, formData) => {
        try {
            const response = await api.post(`/chat/rooms/${roomId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get announcements
    getAnnouncements: async (classId) => {
        try {
            const response = await api.get(`/chat/announcements/${classId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Create announcement (Teacher only)
    createAnnouncement: async (classId, announcementData) => {
        try {
            const response = await api.post(`/chat/announcements/${classId}`, announcementData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Mark messages as read
    markAsRead: async (roomId, messageIds) => {
        try {
            const response = await api.post(`/chat/rooms/${roomId}/read`, { messageIds });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default chatService;