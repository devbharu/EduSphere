// src/context/WebRTCContext.jsx (FINAL CORRECTED VERSION - Token Retrieval Fixed)

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
// DESTRUCTURING 'socket' and 'connected' from the useSocket hook
import { useSocket } from "./SocketContext";
import { createPeerConnection } from "../utils/rtc";
import { useAuth } from "./AuthContext";

const WebRTCCallContext = createContext(null);

// Helper function to reliably get the token
const getAuthToken = () => localStorage.getItem('token');


export const WebRTCProvider = ({ children }) => {
    // CORRECTED DESTRUCTURING
    const { socket, connected } = useSocket();
    const { user } = useAuth();
    // Removed component-level 'authToken' state variable

    const localStreamRef = useRef(null);
    const pcsRef = useRef({});
    const remoteStreamsRef = useRef({});

    // --- WebRTC States ---
    const [participants, setParticipants] = useState([]);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);

    // --- Live Class Management States ---
    const [activeLiveClasses, setActiveLiveClasses] = useState([]);
    const [liveClassLoading, setLiveClassLoading] = useState(false);
    const [liveClassError, setLiveClassError] = useState(null);


    // --- Helper: Safely Remove Socket Listeners ---
    const cleanupSocketListeners = () => {
        if (socket && typeof socket.off === 'function') {
            socket.off("all-users");
            socket.off("user-joined");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
            socket.off("user-left");
            socket.off("live_class_added");
            socket.off("live_class_deleted"); // ⬅️ NEW: Cleanup for deletion
        }
    };

    // 9. Fetch Live Classes (Token retrieved inside function)
    const fetchLiveClasses = async () => {
        setLiveClassLoading(true);
        setLiveClassError(null);
        const token = getAuthToken(); // <-- Retrieve token here
        if (!token) {
            setLiveClassError("Authentication token missing.");
            setLiveClassLoading(false);
            return [];
        }

        try {
            const response = await fetch('/api/liveClasses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // <-- Use retrieved token
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch live classes.');
            }

            const data = await response.json();
            setActiveLiveClasses(data);
            setLiveClassLoading(false);
            return data;
        } catch (err) {
            console.error("Fetch Live Classes Error:", err.message);
            setLiveClassError(err.message);
            setLiveClassLoading(false);
            return [];
        }
    };

    // 10. Create Live Class (Token retrieved inside function)
    const createLiveClass = async (title, subject) => {
        const token = getAuthToken(); // <-- Retrieve token here
        if (!token) {
            throw new Error("Authentication required to create a class.");
        }

        try {
            const response = await fetch('/api/liveClasses/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <-- Use retrieved token
                },
                body: JSON.stringify({ title, subject })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create live class.');
            }

            handleLiveClassAdded(data.class);
            return data.class;

        } catch (error) {
            console.error("Create Live Class Error:", error.message);
            throw error;
        }
    };

    // 11. Delete Live Class (NEW FUNCTION)
    const deleteLiveClass = async (classId) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required to delete a class.");
        }

        try {
            const response = await fetch(`/api/liveClasses/${classId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete live class.');
            }

            // Manually update state for immediate feedback, though the socket event will also fire.
            handleLiveClassDeleted(classId);
            return { success: true, message: data.message };

        } catch (error) {
            console.error(`Delete Live Class Error for ID ${classId}:`, error.message);
            throw error;
        }
    };


    // 12. Handle Real-time Class Addition 
    const handleLiveClassAdded = (newClass) => {
        console.log("Real-time: New class added:", newClass.title);
        setActiveLiveClasses(prev => [newClass, ...prev.filter(c => c._id !== newClass._id)]);
    };

    // 13. Handle Real-time Class Deletion (NEW FUNCTION)
    const handleLiveClassDeleted = (classId) => {
        console.log("Real-time: Class deleted:", classId);
        setActiveLiveClasses(prev => prev.filter(c => c._id !== classId));
    };


    // 1. Initialize Local Media (Camera/Mic)
    const initLocalMedia = async () => {
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            setIsVideoOn(true);
            setIsAudioOn(true);
            setParticipants(prev => {
                const others = prev.filter(p => p.socketId !== "me");
                return [{ socketId: "me", name: user?.name || "You", stream: stream, isLocal: true }, ...others];
            });
            return stream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
            throw err;
        }
    };

    // 2. Join Room Function
    const joinRoom = async (roomId) => {
        if (!socket || !connected) {
            console.warn("Socket not available or disconnected, cannot join room yet.");
            return;
        }
        if (!localStreamRef.current) {
            try {
                await initLocalMedia();
            } catch (err) {
                console.error("Cannot join room without media permissions");
                return;
            }
        }
        cleanupSocketListeners();
        socket.on("live_class_added", handleLiveClassAdded);
        socket.on("live_class_deleted", handleLiveClassDeleted); // ⬅️ NEW: Register deletion listener

        console.log(`Joining Video Room: ${roomId}`);
        socket.emit("join-video-room", { roomId });

        if (typeof socket.on === 'function') {
            socket.on("all-users", ({ users }) => {
                console.log("Existing users in room:", users);
                users.forEach((remoteSocketId) => {
                    createOffer(remoteSocketId);
                });
            });
            socket.on("user-joined", ({ socketId, userName }) => {
                console.log(`User joined: ${userName} (${socketId})`);
            });
            socket.on("offer", async ({ caller, offer }) => {
                await handleReceiveOffer(caller, offer);
            });
            socket.on("answer", async ({ from, answer }) => {
                const pc = pcsRef.current[from];
                if (pc) {
                    try {
                        await pc.setRemoteDescription(answer);
                    } catch (e) {
                        console.error("Error setting remote description (answer):", e);
                    }
                }
            });
            socket.on("ice-candidate", async ({ from, candidate }) => {
                const pc = pcsRef.current[from];
                if (pc && candidate) {
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (e) {
                        console.error("Error adding ICE candidate:", e);
                    }
                }
            });
            socket.on("user-left", (socketId) => {
                console.log(`User left: ${socketId}`);
                removePeer(socketId);
            });
        }
    };

    // 3. Create Offer 
    const createOffer = async (targetSocketId) => {
        if (!socket || !connected || pcsRef.current[targetSocketId]) return;
        const pc = createPeerConnection({
            onTrack: (event) => handleTrackEvent(event, targetSocketId),
            onIceCandidate: (candidate) => {
                if (socket) {
                    socket.emit("ice-candidate", { target: targetSocketId, candidate });
                }
            }
        });
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }
        pcsRef.current[targetSocketId] = pc;
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", { target: targetSocketId, offer });
        } catch (err) {
            console.error("Error creating offer:", err);
        }
    };

    // 4. Handle Received Offer 
    const handleReceiveOffer = async (senderSocketId, offer) => {
        if (!socket || !connected) return;
        const pc = createPeerConnection({
            onTrack: (event) => handleTrackEvent(event, senderSocketId),
            onIceCandidate: (candidate) => {
                if (socket) {
                    socket.emit("ice-candidate", { target: senderSocketId, candidate });
                }
            }
        });
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }
        pcsRef.current[senderSocketId] = pc;
        try {
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answer", { target: senderSocketId, answer });
        } catch (err) {
            console.error("Error handling received offer:", err);
        }
    };

    // 5. Handle Remote Media Track
    const handleTrackEvent = (event, socketId) => {
        const stream = event.streams[0];
        remoteStreamsRef.current[socketId] = stream;
        setParticipants(prev => {
            if (prev.some(p => p.socketId === socketId)) return prev;
            return [{ socketId, name: "Participant", stream, isLocal: false }, ...prev];
        });
    };

    // 6. Remove Peer
    const removePeer = (socketId) => {
        if (pcsRef.current[socketId]) {
            pcsRef.current[socketId].close();
            delete pcsRef.current[socketId];
        }
        delete remoteStreamsRef.current[socketId];
        setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    };

    // 7. Leave Room (Cleanup)
    const leaveRoom = (roomId) => {
        Object.values(pcsRef.current).forEach(pc => pc.close());
        pcsRef.current = {};
        remoteStreamsRef.current = {};
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setParticipants([]);
        cleanupSocketListeners();
    };

    // 8. Toggles
    const toggleVideo = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsVideoOn(track.enabled);
        }
    };

    const toggleAudio = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsAudioOn(track.enabled);
        }
    };


    // Global Cleanup on Unmount
    useEffect(() => {
        if (socket && typeof socket.on === 'function') {
            socket.on("live_class_added", handleLiveClassAdded);
            socket.on("live_class_deleted", handleLiveClassDeleted); // ⬅️ NEW: Register global deletion listener
        }

        return () => {
            Object.values(pcsRef.current).forEach(pc => pc.close());
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(t => t.stop());
            }
            if (socket && typeof socket.off === 'function') {
                socket.off("live_class_added");
                socket.off("live_class_deleted"); // ⬅️ NEW: Unregister global deletion listener
            }
        };
    }, [socket]);


    return (
        <WebRTCCallContext.Provider
            value={{
                participants,
                initLocalMedia,
                joinRoom,
                leaveRoom,
                toggleVideo,
                toggleAudio,
                isVideoOn,
                isAudioOn,

                // --- Live Class Management Exports ---
                activeLiveClasses,
                fetchLiveClasses,
                createLiveClass,
                deleteLiveClass, // ⬅️ NEW EXPORT
                liveClassLoading,
                liveClassError,
            }}
        >
            {children}
        </WebRTCCallContext.Provider>
    );
};

export const useWebRTCCall = () => useContext(WebRTCCallContext);