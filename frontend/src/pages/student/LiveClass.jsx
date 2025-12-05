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
    Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LiveClass = () => {
    const navigate = useNavigate();
    const { classId } = useParams();
    const { user } = useAuth();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showParticipants, setShowParticipants] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [localStream, setLocalStream] = useState(null);
    const [classInfo, setClassInfo] = useState(null);

    useEffect(() => {
        initializeClass();
        startLocalStream();

        return () => {
            // Cleanup
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const initializeClass = () => {
        // TODO: Fetch class info from API
        setClassInfo({
            id: classId,
            name: 'Mathematics - Calculus',
            teacher: 'Mr. Johnson',
            participants: 15,
            startTime: new Date(),
        });
    };

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Failed to access camera/microphone:', error);
            alert('Could not access camera or microphone. Please check permissions.');
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                });
                // TODO: Replace video track with screen share
                setIsScreenSharing(true);
            } else {
                // TODO: Stop screen share and switch back to camera
                setIsScreenSharing(false);
            }
        } catch (error) {
            console.error('Screen sharing failed:', error);
        }
    };

    const leaveClass = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        navigate('/dashboard');
    };

    const sendMessage = () => {
        if (messageInput.trim()) {
            setChatMessages([
                ...chatMessages,
                {
                    id: Date.now(),
                    sender: user?.name,
                    message: messageInput,
                    time: new Date().toLocaleTimeString(),
                },
            ]);
            setMessageInput('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-700 rounded-lg text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-white font-bold">{classInfo?.name}</h1>
                            <p className="text-gray-400 text-sm">{classInfo?.teacher} • {classInfo?.participants} participants</p>
                        </div>
                    </div>

                    {/* End Call Button */}
                    <button
                        onClick={leaveClass}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                        <Phone size={18} />
                        Leave
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 relative bg-black">
                    {/* Remote/Teacher Video (Main) */}
                    <div className="w-full h-full flex items-center justify-center">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="max-w-full max-h-full"
                        />
                        {!remoteVideoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users size={48} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-400">Waiting for teacher to join...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover mirror"
                        />
                        {!isVideoOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <VideoOff className="text-gray-400" size={32} />
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                            You
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-3 bg-gray-800 rounded-full px-4 py-3 shadow-lg">
                            <button
                                onClick={toggleVideo}
                                className={`p-3 rounded-full transition-colors ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {isVideoOn ? <Video className="text-white" size={20} /> : <VideoOff className="text-white" size={20} />}
                            </button>

                            <button
                                onClick={toggleAudio}
                                className={`p-3 rounded-full transition-colors ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {isAudioOn ? <Mic className="text-white" size={20} /> : <MicOff className="text-white" size={20} />}
                            </button>

                            <button
                                onClick={toggleScreenShare}
                                className={`p-3 rounded-full transition-colors ${isScreenSharing ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                            >
                                <Monitor className="text-white" size={20} />
                            </button>

                            <button
                                onClick={() => setShowParticipants(!showParticipants)}
                                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
                            >
                                <Users className="text-white" size={20} />
                            </button>

                            <button
                                onClick={() => setShowChat(!showChat)}
                                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
                            >
                                <MessageSquare className="text-white" size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-white font-bold">Chat</h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-primary-400 text-sm font-medium">{msg.sender}</span>
                                        <span className="text-gray-500 text-xs">{msg.time}</span>
                                    </div>
                                    <p className="text-gray-200 text-sm">{msg.message}</p>
                                </div>
                            ))}
                            {chatMessages.length === 0 && (
                                <p className="text-gray-500 text-center text-sm">No messages yet</p>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS for mirroring local video */}
            <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
        </div>
    );
};

export default LiveClass;