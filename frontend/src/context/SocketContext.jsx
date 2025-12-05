import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Ensure this matches your server port
    const SOCKET_URL = "http://localhost:5000";

    useEffect(() => {
        let newSocket;

        if (isAuthenticated && user) {
            const token = localStorage.getItem("token");

            // Initialize Socket
            newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
            });

            newSocket.on('connect', () => {
                console.log("✅ Socket connected:", newSocket.id);
                setConnected(true);
            });

            newSocket.on('connect_error', (err) => {
                console.error("❌ Socket Connection Error:", err.message);
                setConnected(false);
            });

            newSocket.on('disconnect', () => {
                console.log("⚠️ Socket disconnected");
                setConnected(false);
            });

            setSocket(newSocket);
        }

        // Cleanup function (Runs on logout or unmount)
        return () => {
            if (newSocket) {
                newSocket.disconnect();
                setSocket(null);
                setConnected(false);
            }
        };
    }, [isAuthenticated, user]);

    // --- Socket Emitters (Wrapped in useCallback to prevent re-renders) ---
    const joinRoom = useCallback((roomId) => {
        if (socket && connected) socket.emit("join_room", { roomId });
    }, [socket, connected]);

    const sendMessage = useCallback((roomId, message) => {
        if (socket && connected) socket.emit("send_message", { roomId, message });
    }, [socket, connected]);

    // --- Event Listeners (Wrapped in useCallback) ---
    const onChatHistory = useCallback((cb) => socket?.on("chat_history", cb), [socket]);
    const offChatHistory = useCallback((cb) => socket?.off("chat_history", cb), [socket]);

    const onReceiveMessage = useCallback((cb) => socket?.on("receive_message", cb), [socket]);
    const offReceiveMessage = useCallback((cb) => socket?.off("receive_message", cb), [socket]);

    const onRoomAdded = useCallback((cb) => socket?.on("room_added", cb), [socket]);
    const offRoomAdded = useCallback((cb) => socket?.off("room_added", cb), [socket]);

    return (
        <SocketContext.Provider value={{
            socket,
            connected,
            joinRoom,
            sendMessage,
            onChatHistory,
            offChatHistory,
            onReceiveMessage,
            offReceiveMessage,
            onRoomAdded,
            offRoomAdded
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket must be used inside SocketProvider");
    return context;
};

export default SocketContext;