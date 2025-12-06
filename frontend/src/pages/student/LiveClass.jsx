/**
 * Live Class Page - WebRTC video/audio streaming
 * Real-time interaction with teacher and students
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Video,
    VideoOff,
    Mic,
    MicOff,
    Monitor,
    Users,
    MessageSquare,
    Phone,
    Copy,
    Check,
    Trash2 // ⬅️ Added Trash Icon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWebRTCCall } from '../../context/WebRTCContext';
import { useSocket } from '../../context/SocketContext';

const LiveClass = () => {
    const navigate = useNavigate();
    const { classId } = useParams();
    const { user } = useAuth(); // Contains user role/details

    // Assume user.role === 'teacher' for simplicity in this frontend logic
    // The backend will perform the definitive check.
    const isTeacher = user?.role === 'teacher';

    // 1. Get Socket with safety checks
    const { socket } = useSocket();

    // 2. WebRTC Context (Video logic)
    const {
        participants,
        initLocalMedia,
        joinRoom,
        leaveRoom,
        toggleVideo,
        toggleAudio,
        isVideoOn,
        isAudioOn,
        deleteLiveClass // ⬅️ NEW: Import delete function
    } = useWebRTCCall();

    // Local State
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isInitializing, setIsInitializing] = useState(true);
    const [copied, setCopied] = useState(false);

    // ============================================
    // 🎥 VIDEO LIFECYCLE
    // ============================================
    useEffect(() => {
        let mounted = true;

        const connectToClass = async () => {
            try {
                setIsInitializing(true);
                // 1. Get Camera/Mic permissions first
                await initLocalMedia();

                if (mounted) {
                    // 2. Join the Video Room
                    joinRoom(classId);
                    setIsInitializing(false);
                }
            } catch (error) {
                console.error("Failed to join class:", error);
                if (mounted) setIsInitializing(false);
                alert("Could not access devices. Please check permissions.");
            }
        };

        connectToClass();

        return () => {
            mounted = false;
            leaveRoom(classId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]);

    // ============================================
    // 💬 CHAT LIFECYCLE (Defensive Coding)
    // ============================================
    useEffect(() => {
        // CRITICAL FIX: Ensure socket exists AND has the emit function
        if (!socket || typeof socket.emit !== 'function') return;

        console.log("Connecting to Chat Room:", classId);

        // 1. Join Chat Room
        socket.emit("join_room", { roomId: classId });

        // 2. Define Handlers
        const handleHistory = (messages) => {
            if (Array.isArray(messages)) setChatMessages(messages);
        };

        const handleNewMessage = (newMessage) => {
            setChatMessages((prev) => [...prev, newMessage]);
        };

        // 3. Attach Listeners
        socket.on("chat_history", handleHistory);
        socket.on("receive_message", handleNewMessage);

        // 4. Cleanup
        return () => {
            socket.off("chat_history", handleHistory);
            socket.off("receive_message", handleNewMessage);
        };
    }, [socket, classId]);

    // ============================================
    // ⚡ ACTIONS
    // ============================================
    const handleLeaveClass = async () => {
        // 1. Execute deletion if the user is the teacher
        if (isTeacher) {
            if (window.confirm("Are you sure you want to END and DELETE this live class for all participants?")) {
                try {
                    await deleteLiveClass(classId);
                    alert("Class successfully ended and deleted.");
                } catch (error) {
                    console.error("Failed to delete class:", error);
                    alert(`Failed to end class: ${error.message}. You can still leave the session.`);
                }
            } else {
                // If the teacher cancels deletion, they stay in the room.
                return;
            }
        }

        // 2. Leave the WebRTC session (mandatory for both roles)
        leaveRoom(classId);

        // 3. Navigate away
        navigate('/dashboard');
    };


    const handleCopyLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendMessage = () => {
        // Safety Check: socket?.emit
        if (messageInput.trim() && socket && typeof socket.emit === 'function') {
            socket.emit("send_message", {
                roomId: classId,
                message: messageInput,
                // Add sender details here if needed for chat history (e.g., senderName: user?.name)
            });
            setMessageInput('');
        } else {
            console.warn("Socket not ready to send message");
        }
    };

    const toggleScreenShare = () => {
        alert("Screen sharing is not yet implemented in the WebRTC Context.");
        setIsScreenSharing(!isScreenSharing);
    };

    // ============================================
    // 🎨 RENDER HELPERS
    // ============================================

    // Separate Local user from Remote users
    const localParticipant = participants.find(p => p.isLocal);
    const remoteParticipants = participants.filter(p => !p.isLocal);

    // Determine Main View: First remote user, or null (waiting state)
    const mainParticipant = remoteParticipants.length > 0 ? remoteParticipants[0] : null;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
            {/* --- TOP BAR --- */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 shadow-md z-30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-white font-bold hidden sm:block text-lg">Classroom: {classId}</h1>
                            <div className="flex items-center gap-3 text-gray-400 text-xs sm:text-sm">
                                <span className="flex items-center gap-1 bg-gray-700 px-2 py-0.5 rounded-full">
                                    <Users size={12} />
                                    {participants.length} Active
                                </span>

                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                                >
                                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                    {copied ? "Copied" : "Copy Invite Link"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLeaveClass}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm font-medium text-sm ${isTeacher
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                            }`}
                    >
                        {isTeacher ? (
                            <>
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">End & Delete Class</span>
                            </>
                        ) : (
                            <>
                                <Phone size={18} className="rotate-[135deg]" />
                                <span className="hidden sm:inline">Leave Class</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* 1. VIDEO AREA */}
                <div className={`flex-1 relative bg-black flex items-center justify-center transition-all duration-300 ${showChat ? 'mr-0' : ''}`}>

                    {/* A. Main Remote Video */}
                    {mainParticipant ? (
                        <VideoPlayer
                            stream={mainParticipant.stream}
                            isLocal={false}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        // Waiting State
                        <div className="text-center p-8">
                            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Users size={48} className="text-gray-500" />
                            </div>
                            <h3 className="text-gray-200 font-semibold text-xl">Waiting for others to join...</h3>
                            <p className="text-gray-500 mt-2">Share the invite link to start the class.</p>
                        </div>
                    )}

                    {/* B. Local Video (Picture-in-Picture) */}
                    {localParticipant && (
                        <div className="absolute bottom-24 right-6 w-40 sm:w-56 aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-700 z-10 transition-transform hover:scale-105">
                            <VideoPlayer
                                stream={localParticipant.stream}
                                isLocal={true}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                                You
                            </div>
                            {!isVideoOn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/95">
                                    <VideoOff className="text-gray-500" size={24} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* C. Remote Participants Grid (Top Right) */}
                    {remoteParticipants.length > 1 && (
                        <div className="absolute top-4 right-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 z-10 scrollbar-hide">
                            {remoteParticipants.slice(1).map((p) => (
                                <div key={p.socketId} className="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 relative">
                                    <VideoPlayer
                                        stream={p.stream}
                                        isLocal={false}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] text-white">
                                        Participant
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* D. Bottom Control Bar */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-auto max-w-[90%]">
                        <div className="flex items-center gap-2 sm:gap-3 bg-gray-900/90 backdrop-blur-md px-4 sm:px-6 py-3 rounded-full shadow-2xl border border-gray-700">
                            <ControlButton
                                onClick={toggleVideo}
                                isActive={isVideoOn}
                                onIcon={<Video size={20} />}
                                offIcon={<VideoOff size={20} />}
                                activeColor="bg-gray-700 hover:bg-gray-600"
                                inactiveColor="bg-red-500 hover:bg-red-600"
                            />
                            <ControlButton
                                onClick={toggleAudio}
                                isActive={isAudioOn}
                                onIcon={<Mic size={20} />}
                                offIcon={<MicOff size={20} />}
                                activeColor="bg-gray-700 hover:bg-gray-600"
                                inactiveColor="bg-red-500 hover:bg-red-600"
                            />
                            {isTeacher && ( // Only allow teacher to share screen
                                <ControlButton
                                    onClick={toggleScreenShare}
                                    isActive={!isScreenSharing}
                                    onIcon={<Monitor size={20} />}
                                    offIcon={<Monitor size={20} />}
                                    activeColor="bg-gray-700 hover:bg-gray-600"
                                />
                            )}


                            <div className="w-px h-8 bg-gray-700 mx-1"></div>

                            <ControlButton
                                onClick={() => setShowChat(!showChat)}
                                isActive={true}
                                onIcon={<MessageSquare size={20} />}
                                activeColor={`hover:bg-gray-600 ${showChat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. CHAT SIDEBAR */}
                {showChat && (
                    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col shadow-xl z-20 absolute right-0 h-full sm:relative">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800">
                            <h3 className="text-white font-semibold text-sm">Class Chat</h3>
                            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white transition-colors">×</button>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                            {chatMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                                    <MessageSquare size={32} className="opacity-20" />
                                    <p className="text-xs">No messages yet.</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?._id || msg.sender === user?.name;
                                    return (
                                        <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'
                                                }`}>
                                                {!isMe && (
                                                    <span className="block text-[10px] text-gray-400 font-bold mb-1">
                                                        {msg.senderName || msg.sender || "User"}
                                                    </span>
                                                )}
                                                <p className="leading-snug break-words">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-600 mt-1 px-1">
                                                {msg.time || new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-gray-800 bg-gray-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type message..."
                                    className="flex-1 bg-gray-700 text-white text-sm rounded-full px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none border border-transparent placeholder-gray-400"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!messageInput.trim() || !socket}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
                                >
                                    <ArrowLeft size={16} className="rotate-180" /> {/* Send Icon */}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================
// 🧩 SUB-COMPONENTS
// ============================================

const VideoPlayer = ({ stream, isLocal, className }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal} // Important: Mute local to avoid feedback loop
            className={`${className} ${isLocal ? 'scale-x-[-1]' : ''}`} // Mirror local video
        />
    );
};

const ControlButton = ({ onClick, isActive, onIcon, offIcon, activeColor, inactiveColor }) => (
    <button
        onClick={onClick}
        className={`p-3.5 rounded-full transition-all duration-200 text-white shadow-sm ${isActive ? activeColor : inactiveColor || activeColor}`}
    >
        {isActive ? onIcon : (offIcon || onIcon)}
    </button>
);

export default LiveClass;