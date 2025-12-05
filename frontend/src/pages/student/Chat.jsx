/**
 * Chat Page - Class chat and announcements
 * Real-time messaging with Socket.io
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    ArrowLeft,
    Send,
    Paperclip,
    Search,
    MessageSquare,
    Bell,
    Users,
    Clock,
    Check,
    CheckCheck,
    Smile,
    Image as ImageIcon,
    X,
    Menu
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const Chat = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();
    const messagesEndRef = useRef(null);

    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        loadChatRooms();
        loadAnnouncements();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            loadMessages(selectedRoom.id);
            // joinRoom(selectedRoom.id);
        }
    }, [selectedRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatRooms = async () => {
        try {
            setTimeout(() => {
                setRooms([
                    { id: 1, name: 'Mathematics Class', lastMessage: 'Assignment due tomorrow', unread: 3, members: 45, online: 12 },
                    { id: 2, name: 'Physics Class', lastMessage: 'Lab report guidelines', unread: 0, members: 38, online: 8 },
                    { id: 3, name: 'Chemistry Class', lastMessage: 'Test scheduled', unread: 1, members: 42, online: 15 },
                    { id: 4, name: 'Computer Science', lastMessage: 'Project submission', unread: 0, members: 50, online: 20 },
                ]);
                setSelectedRoom({ id: 1, name: 'Mathematics Class', lastMessage: 'Assignment due tomorrow', unread: 3, members: 45, online: 12 });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
            setLoading(false);
        }
    };

    const loadMessages = async (roomId) => {
        try {
            setTimeout(() => {
                setMessages([
                    {
                        id: 1,
                        sender: 'Mr. Johnson',
                        message: 'Good morning everyone! Today we will cover calculus.',
                        time: '09:00 AM',
                        isOwn: false,
                        avatar: 'MJ',
                        read: true,
                    },
                    {
                        id: 2,
                        sender: user?.name || 'You',
                        message: 'Good morning sir!',
                        time: '09:01 AM',
                        isOwn: true,
                        avatar: user?.name?.charAt(0) || 'U',
                        read: true,
                    },
                    {
                        id: 3,
                        sender: 'Alice Smith',
                        message: 'Looking forward to the class!',
                        time: '09:02 AM',
                        isOwn: false,
                        avatar: 'AS',
                        read: true,
                    },
                ]);
            }, 500);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const loadAnnouncements = async () => {
        try {
            setAnnouncements([
                {
                    id: 1,
                    title: 'Midterm Exams Schedule',
                    message: 'Midterm exams will be held from March 20-25',
                    date: '2024-03-10',
                    priority: 'high',
                },
                {
                    id: 2,
                    title: 'Holiday Notice',
                    message: 'School will be closed on March 15',
                    date: '2024-03-08',
                    priority: 'medium',
                },
            ]);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        }
    };

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedRoom) return;

        const newMessage = {
            id: Date.now(),
            sender: user?.name || 'You',
            message: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
            avatar: user?.name?.charAt(0) || 'U',
            read: false,
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className={`absolute inset-0 border-4 rounded-full ${
                            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
                        }`}></div>
                        <div className={`absolute inset-0 border-4 border-transparent rounded-full animate-spin ${
                            theme === 'dark' ? 'border-t-blue-500' : 'border-t-blue-600'
                        }`}></div>
                    </div>
                    <p className={`text-lg font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                        Loading messages...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Theme Toggle Component - Already Added! */}
            <ThemeToggle />

            {/* Sidebar - Chat Rooms & Announcements */}
            <div className={`w-full lg:w-96 flex-shrink-0 flex flex-col border-r transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } ${isSidebarOpen ? 'block' : 'hidden lg:flex'}`}>
                {/* Header */}
                <div className={`p-5 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`p-2 rounded-xl transition-all duration-200 ${
                                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                                aria-label="Back to Dashboard"
                            >
                                <ArrowLeft size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                            </button>
                            <div>
                                <h1 className={`text-xl font-bold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>Messages</h1>
                                <p className={`text-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>Stay connected with your classes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className={`lg:hidden p-2 rounded-xl ${
                                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            aria-label="Close sidebar"
                        >
                            <X size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} size={18} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                            }`}
                        />
                    </div>
                </div>

                {/* Announcements Section */}
                <div className={`p-4 border-b ${
                    theme === 'dark'
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-blue-50 border-blue-100'
                }`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1.5 rounded-lg ${
                            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                            <Bell className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={16} />
                        </div>
                        <h3 className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                        }`}>Important Announcements</h3>
                    </div>
                    <div className="space-y-2">
                        {announcements.slice(0, 2).map(announcement => (
                            <div key={announcement.id} className={`rounded-xl p-3 border transition-all duration-200 hover:shadow-md ${
                                theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-white border-gray-200'
                            }`}>
                                <div className="flex items-start gap-2 mb-1">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                        announcement.priority === 'high'
                                            ? 'bg-red-500'
                                            : announcement.priority === 'medium'
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}></div>
                                    <h4 className={`font-semibold text-sm flex-1 ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{announcement.title}</h4>
                                </div>
                                <p className={`text-xs ml-3.5 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>{announcement.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Rooms List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 px-4">
                            <MessageSquare size={48} className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} />
                            <p className={`mt-3 text-sm ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>No conversations found</p>
                        </div>
                    ) : (
                        filteredRooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => {
                                    setSelectedRoom(room);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full p-4 text-left border-b transition-all duration-200 ${
                                    selectedRoom?.id === room.id
                                        ? theme === 'dark'
                                            ? 'bg-blue-500/10 border-blue-500/20'
                                            : 'bg-blue-50 border-blue-100'
                                        : theme === 'dark'
                                            ? 'border-gray-700 hover:bg-gray-700/50'
                                            : 'border-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`font-semibold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>{room.name}</h3>
                                    {room.unread > 0 && (
                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg">
                                            {room.unread}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm mb-2 truncate ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>{room.lastMessage}</p>
                                <div className="flex items-center gap-3 text-xs">
                                    <div className={`flex items-center gap-1 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                    }`}>
                                        <Users size={12} />
                                        <span>{room.members}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <span>{room.online} online</span>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className={`p-5 border-b shadow-sm ${
                            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className={`lg:hidden p-2 rounded-xl ${
                                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                        }`}
                                        aria-label="Open sidebar"
                                    >
                                        <Menu size={20} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} />
                                    </button>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                                        theme === 'dark'
                                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                            : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                                    }`}>
                                        {selectedRoom.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-bold ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{selectedRoom.name}</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-green-500 text-xs">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                <span>{selectedRoom.online} members online</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                    <Users size={14} />
                                    <span>{selectedRoom.members} members</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                        }`}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    {!msg.isOwn && (
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg ${
                                            theme === 'dark'
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                                                : 'bg-gradient-to-br from-purple-600 to-pink-600'
                                        }`}>
                                            {msg.avatar}
                                        </div>
                                    )}

                                    <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                        {!msg.isOwn && (
                                            <p className={`text-xs font-semibold mb-1 px-2 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>{msg.sender}</p>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-3 shadow-md ${
                                                msg.isOwn
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                                    : theme === 'dark'
                                                        ? 'bg-gray-800 text-white border border-gray-700 rounded-bl-sm'
                                                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                                            <div className={`flex items-center gap-1 mt-2 ${
                                                msg.isOwn ? 'justify-end' : 'justify-start'
                                            }`}>
                                                <Clock size={12} className={msg.isOwn ? 'text-blue-200' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} />
                                                <p className={`text-xs ${
                                                    msg.isOwn ? 'text-blue-200' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                                }`}>
                                                    {msg.time}
                                                </p>
                                                {msg.isOwn && (
                                                    msg.read ? (
                                                        <CheckCheck size={14} className="text-blue-200" />
                                                    ) : (
                                                        <Check size={14} className="text-blue-200" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className={`p-4 border-t ${
                            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                        }`}>
                            <div className="flex gap-2 items-end">
                                <button className={`p-3 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`} title="Attach file">
                                    <Paperclip size={20} />
                                </button>
                                <button className={`p-3 rounded-xl transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`} title="Add image">
                                    <ImageIcon size={20} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type your message..."
                                        className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 pr-12 ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                                        }`}
                                    />
                                    <button className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                                        theme === 'dark'
                                            ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`} title="Add emoji">
                                        <Smile size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={sendMessage}
                                    disabled={!messageInput.trim()}
                                    className={`p-3 rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                        theme === 'dark'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                    }`}
                                    title="Send message"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center px-4">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4 ${
                                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                            }`}>
                                <MessageSquare size={48} className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} />
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>Welcome to Messages</h3>
                            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Select a conversation to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;