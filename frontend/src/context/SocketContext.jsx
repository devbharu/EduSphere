/**
 * SocketContext - Manages WebSocket connection globally
 * Handles real-time chat, notifications, and live updates
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // Only connect socket if user is authenticated
        if (isAuthenticated && user) {
            connectSocket();
        } else {
            disconnectSocket();
        }

        // Cleanup on unmount
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, user]);

    // Connect to socket server
    const connectSocket = () => {
        const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
            auth: {
                token: localStorage.getItem('token'),
                userId: user?.id || user?._id,
            },
            transports: ['websocket', 'polling'],
        });

        // Socket event listeners
        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        setSocket(newSocket);
    };

    // Disconnect socket
    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setConnected(false);
        }
    };

    // Emit event to server
    const emit = (event, data) => {
        if (socket && connected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    };

    // Listen to event from server
    const on = (event, callback) => {
        if (socket) {
            socket.on(event, callback);
        }
    };

    // Remove event listener
    const off = (event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    };

    const value = {
        socket,
        connected,
        emit,
        on,
        off,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom hook to use socket context
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export default SocketContext;