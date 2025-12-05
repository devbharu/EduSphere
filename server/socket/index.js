const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("../models/messages");
const User = require("../models/user");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins (Update this for production)
            methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
    });

    // --- MIDDLEWARE: AUTHENTICATION ---
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication error: No token provided"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch User to ensure we have the Name
            const user = await User.findById(decoded.id || decoded._id).select("name _id");

            if (!user) {
                return next(new Error("User not found"));
            }

            // Attach user info to socket session
            socket.user = {
                id: user._id.toString(), // Convert to string for consistency
                name: user.name
            };

            next();
        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    // --- CONNECTION ---
    io.on("connection", (socket) => {
        console.log(`✅ Connected: ${socket.user.name} (${socket.id})`);

        // 1. JOIN ROOM
        socket.on("join_room", async ({ roomId }) => {
            if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
                console.error(`Invalid Room ID: ${roomId}`);
                return;
            }

            // Join the specific room channel
            socket.join(roomId);
            console.log(`👥 ${socket.user.name} joined room: ${roomId}`);

            // Fetch and emit chat history
            try {
                const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
                socket.emit("chat_history", messages);
            } catch (err) {
                console.error("History error:", err);
                socket.emit("chat_history", []);
            }
        });

        // 2. SEND MESSAGE
        socket.on("send_message", async ({ roomId, message }) => {
            if (!message || !mongoose.Types.ObjectId.isValid(roomId)) return;

            console.log(`📩 ${socket.user.name} sent to ${roomId}: ${message}`);

            try {
                // Save to Database
                const newMessage = await Message.create({
                    roomId,
                    senderId: socket.user.id,
                    senderName: socket.user.name,
                    message,
                });

                // Broadcast to EVERYONE in the room (including sender)
                io.in(roomId).emit("receive_message", newMessage);

            } catch (err) {
                console.error("Message save error:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ Disconnected: ${socket.user.name}`);
        });
    });

    return io;
};

// Export getIO so routes/rooms.js can use it for 'room_added' events
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };