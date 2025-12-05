import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
    ArrowLeft, Send, Search, Menu, Wifi, WifiOff, Clock, CheckCheck, Plus,
    MessageSquare
} from 'lucide-react';

const Chat = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();

    // Destructure socket functions
    const {
        connected,
        joinRoom,
        sendMessage: sendSocketMessage,
        onReceiveMessage,
        offReceiveMessage,
        onChatHistory,
        offChatHistory,
        onRoomAdded,
        offRoomAdded
    } = useSocket();

    const messagesEndRef = useRef(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State for creating a new room
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    const API_URL = "http://localhost:5000/api";

    // --- Helper: Format Message ---
    const formatMessage = useCallback((data) => {
        const isOwn = (data.senderId === user?.id) || (data.senderId === user?._id);

        return {
            id: data._id || data.id || Date.now() + Math.random(),
            sender: data.senderName || data.sender || "Unknown",
            message: data.message || data.content || "",
            time: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: isOwn,
            avatar: (data.senderName || "U").charAt(0).toUpperCase(),
            pending: false
        };
    }, [user]);

    // --- Load Rooms via API ---
    const loadChatRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            // FIX 1: Fetch ALL rooms so new public classes are visible to everyone
            // Was: /rooms/my -> Now: /rooms/all
            const response = await axios.get(`${API_URL}/rooms/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setRooms(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChatRooms();
    }, []);

    // --- Real-time Room Updates ---
    useEffect(() => {
        const handleNewRoom = (newRoom) => {
            console.log("🆕 New Room Received via Socket:", newRoom);

            setRooms(prevRooms => {
                // Prevent duplicates
                const exists = prevRooms.find(r => r._id === newRoom._id);
                if (exists) return prevRooms;

                // Add new room to the top
                return [newRoom, ...prevRooms];
            });
        };

        onRoomAdded(handleNewRoom);
        return () => offRoomAdded(handleNewRoom);
    }, [onRoomAdded, offRoomAdded]);

    // --- Chat Room Logic ---
    useEffect(() => {
        if (!selectedRoom || !connected) return;

        // Join the specific room channel on the server
        console.log("Joining Room:", selectedRoom.name);
        joinRoom(selectedRoom._id);

        const handleHistory = (historyData) => {
            if (Array.isArray(historyData)) {
                setMessages(historyData.map(formatMessage));
                scrollToBottom();
            }
        };

        const handleNewMessage = (newData) => {
            // FIX 2: Check if incoming message belongs to the ACTIVE room
            // This prevents messages from other joined rooms appearing here
            if (newData.roomId !== selectedRoom._id) return;

            setMessages(prev => [...prev, formatMessage(newData)]);
            scrollToBottom();
        };

        onChatHistory(handleHistory);
        onReceiveMessage(handleNewMessage);

        return () => {
            offChatHistory(handleHistory);
            offReceiveMessage(handleNewMessage);
            setMessages([]);
        };
    }, [selectedRoom, connected, joinRoom, onChatHistory, offChatHistory, onReceiveMessage, offReceiveMessage, formatMessage]);

    // --- Send Message ---
    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedRoom) return;

        const rawMsg = messageInput;
        setMessageInput('');

        sendSocketMessage(selectedRoom._id, rawMsg);
    };

    // --- Create Room ---
    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/rooms`,
                { name: newRoomName }, // Removed 'members' as backend usually handles creator
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Optimistic update (Socket will also fire, but this makes it instant for creator)
            setRooms(prev => {
                const exists = prev.find(r => r._id === response.data._id);
                if (exists) return prev;
                return [response.data, ...prev];
            });

            setNewRoomName('');
            setShowCreateRoom(false);
            setSelectedRoom(response.data);
        } catch (error) {
            console.error("Error creating room", error);
            alert("Failed to create room");
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="text-center">Loading Classes...</div>
        </div>
    );

    return (
        <div className={`min-h-screen flex transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>


            {/* Sidebar */}
            <div className={`w-full lg:w-96 border-r flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isSidebarOpen ? 'block' : 'hidden lg:flex'}`}>

                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/dashboard')}><ArrowLeft className={theme === 'dark' ? 'text-white' : 'text-gray-700'} /></button>
                            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Classes</h1>
                        </div>
                        <button
                            onClick={() => setShowCreateRoom(!showCreateRoom)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                            title="Create New Class"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Create Room Input Area */}
                    {showCreateRoom && (
                        <div className="mb-4 flex gap-2 animate-fadeIn">
                            <input
                                type="text"
                                placeholder="Class Name..."
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className={`flex-1 p-2 text-sm rounded border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white'}`}
                            />
                            <button onClick={handleCreateRoom} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add</button>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}
                        />
                    </div>
                </div>

                {/* Room List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredRooms.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No classes found. Create one!</div>
                    ) : (
                        filteredRooms.map(room => (
                            <div
                                key={room._id}
                                onClick={() => { setSelectedRoom(room); setIsSidebarOpen(false); }}
                                className={`p-4 border-b cursor-pointer transition-colors ${selectedRoom?._id === room._id ? (theme === 'dark' ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'bg-blue-50 border-l-4 border-l-blue-500') : ''} ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{room.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 truncate">Click to enter class</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden"><Menu className={theme === 'dark' ? 'text-white' : 'text-gray-800'} /></button>
                                <div>
                                    <h2 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedRoom.name}</h2>
                                    <div className="flex items-center gap-1 text-xs">
                                        {connected ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />}
                                        <span className={connected ? "text-green-600" : "text-red-500"}>{connected ? "Online" : "Connecting..."}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && <div className="text-center text-gray-400 mt-10">Welcome to {selectedRoom.name}! Say Hello 👋</div>}

                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!msg.isOwn && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                            {msg.avatar}
                                        </div>
                                    )}
                                    <div className={`max-w-[70%] flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                                        {!msg.isOwn && <span className="text-xs text-gray-500 ml-1 mb-1">{msg.sender}</span>}
                                        <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.isOwn ? 'bg-blue-600 text-white rounded-br-none' : (theme === 'dark' ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none')}`}>
                                            {msg.message}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1 flex gap-1 items-center">
                                            {msg.time}
                                            {msg.isOwn && (msg.pending ? <Clock size={10} /> : <CheckCheck size={12} className="text-blue-500" />)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                            <div className="flex gap-2 items-center">
                                <input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={connected ? "Type a message..." : "Connecting..."}
                                    disabled={!connected}
                                    className={`flex-1 p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!connected || !messageInput.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                            <MessageSquare size={40} className="text-blue-500" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Class Selected</h3>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Select a class from the sidebar or create a new one to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;