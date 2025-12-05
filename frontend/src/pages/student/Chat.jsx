/**
 * Chat Page - Class chat and announcements
 * Real-time messaging with Socket.io
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
    ArrowLeft,
    Send,
    Paperclip,
    Search,
    MessageSquare,
    Bell
} from 'lucide-react';
import chatService from '../../services/chatService';

const Chat = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, emit, on, off } = useSocket();
    const messagesEndRef = useRef(null);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadChatRooms();
        loadAnnouncements();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            loadMessages(selectedRoom.id);
            joinRoom(selectedRoom.id);
        }
    }, [selectedRoom]);

    useEffect(() => {
        // Listen for new messages via Socket.io
        if (socket) {
            on('new_message', handleNewMessage);
            on('new_announcement', handleNewAnnouncement);
        }

        return () => {
            if (socket) {
                off('new_message', handleNewMessage);
                off('new_announcement', handleNewAnnouncement);
            }
        };
    }, [socket, selectedRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatRooms = async () => {
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                setRooms([
                    { id: 1, name: 'Mathematics Class', lastMessage: 'Assignment due tomorrow', unread: 3 },
                    { id: 2, name: 'Physics Class', lastMessage: 'Lab report guidelines', unread: 0 },
                    { id: 3, name: 'Chemistry Class', lastMessage: 'Test scheduled', unread: 1 },
                    { id: 4, name: 'Computer Science', lastMessage: 'Project submission', unread: 0 },
                ]);
                setSelectedRoom({ id: 1, name: 'Mathematics Class', lastMessage: 'Assignment due tomorrow', unread: 3 });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
            setLoading(false);
        }
    };

    const loadMessages = async (roomId) => {
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                setMessages([
                    {
                        id: 1,
                        sender: 'Mr. Johnson',
                        message: 'Good morning everyone! Today we will cover calculus.',
                        time: '09:00 AM',
                        isOwn: false,
                    },
                    {
                        id: 2,
                        sender: user?.name,
                        message: 'Good morning sir!',
                        time: '09:01 AM',
                        isOwn: true,
                    },
                    {
                        id: 3,
                        sender: 'Alice Smith',
                        message: 'Looking forward to the class!',
                        time: '09:02 AM',
                        isOwn: false,
                    },
                ]);
            }, 500);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const loadAnnouncements = async () => {
        try {
            // TODO: Replace with actual API call
            setAnnouncements([
                {
                    id: 1,
                    title: 'Midterm Exams Schedule',
                    message: 'Midterm exams will be held from March 20-25',
                    date: '2024-03-10',
                },
                {
                    id: 2,
                    title: 'Holiday Notice',
                    message: 'School will be closed on March 15',
                    date: '2024-03-08',
                },
            ]);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        }
    };

    const joinRoom = (roomId) => {
        if (socket) {
            emit('join_room', { roomId, userId: user?.id });
        }
    };

    const handleNewMessage = (message) => {
        if (message.roomId === selectedRoom?.id) {
            setMessages(prev => [...prev, message]);
        }
    };

    const handleNewAnnouncement = (announcement) => {
        setAnnouncements(prev => [announcement, ...prev]);
    };

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedRoom) return;

        const newMessage = {
            id: Date.now(),
            sender: user?.name,
            message: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
        };

        // Add message locally
        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');

        // Send via Socket.io
        if (socket) {
            emit('send_message', {
                roomId: selectedRoom.id,
                message: messageInput,
                sender: user?.name,
                userId: user?.id,
            });
        }

        // TODO: Also save to database via API
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Chat Rooms & Announcements */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>

                {/* Announcements Section */}
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="text-blue-600" size={18} />
                        <h3 className="font-semibold text-blue-900 text-sm">Announcements</h3>
                    </div>
                    {announcements.slice(0, 2).map(announcement => (
                        <div key={announcement.id} className="bg-white rounded-lg p-3 mb-2 text-sm">
                            <h4 className="font-medium text-gray-900 mb-1">{announcement.title}</h4>
                            <p className="text-gray-600 text-xs">{announcement.message}</p>
                        </div>
                    ))}
                </div>

                {/* Chat Rooms List */}
                <div className="flex-1 overflow-y-auto">
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`w-full p-4 text-left border-b border-gray-200 hover:bg-gray-50 transition-colors ${selectedRoom?.id === room.id ? 'bg-primary-50' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                                {room.unread > 0 && (
                                    <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {room.unread}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{room.lastMessage}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">{selectedRoom.name}</h2>
                            <p className="text-sm text-gray-600">Active now</p>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                                        {!msg.isOwn && (
                                            <p className="text-xs text-gray-600 mb-1 ml-2">{msg.sender}</p>
                                        )}
                                        <div
                                            className={`rounded-lg px-4 py-2 ${msg.isOwn
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-xs mt-1 ${msg.isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!messageInput.trim()}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">Select a chat to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;