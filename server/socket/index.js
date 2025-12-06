const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("../models/messages"); // Ensure path is correct
const User = require("../models/user"); // Ensure path is correct

let io;

// Store active users per room: { roomId: [socketId1, socketId2] }
const rooms = {};

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust this to your client URL in production
            methods: ["GET", "POST"],
        },
        transports: ["websocket", "polling"],
    });

    // ===============================
    // ⚡ AUTH MIDDLEWARE
    // ===============================
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication error: No token provided"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user to get name/ID
            const user = await User.findById(decoded.id || decoded._id).select("name _id");
            if (!user) return next(new Error("User not found"));

            socket.user = {
                id: user._id.toString(),
                name: user.name
            };

            next();
        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    // ===============================
    // ⚡ ON CONNECTION
    // ===============================
    io.on("connection", (socket) => {
        console.log(`✅ Connected: ${socket.user.name} (${socket.id})`);

        // ==========================================
        // 1️⃣ CHAT: JOIN ROOM & HISTORY
        // ==========================================
        socket.on("join_room", async ({ roomId }) => {
            if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
                console.error(`Invalid Room ID: ${roomId}`);
                return;
            }

            socket.join(roomId);
            console.log(`👥 ${socket.user.name} joined chat room: ${roomId}`);

            try {
                // Send last 50 messages
                const messages = await Message.find({ roomId })
                    .sort({ createdAt: 1 })
                    .limit(50);
                socket.emit("chat_history", messages);
            } catch (err) {
                console.error("History error:", err);
                socket.emit("chat_history", []);
            }
        });

        // ==========================================
        // 2️⃣ CHAT: SEND MESSAGE
        // ==========================================
        socket.on("send_message", async ({ roomId, message }) => {
            if (!message || !mongoose.Types.ObjectId.isValid(roomId)) return;

            console.log(`📩 ${socket.user.name} sent to ${roomId}: ${message}`);

            try {
                const newMessage = await Message.create({
                    roomId,
                    senderId: socket.user.id,
                    senderName: socket.user.name,
                    message,
                });

                // Broadcast to everyone in the room (including sender)
                io.in(roomId).emit("receive_message", newMessage);
            } catch (err) {
                console.error("Message save error:", err);
            }
        });

        // ==========================================
        // 3️⃣ VIDEO: JOIN ROOM
        // ==========================================
        socket.on("join-video-room", ({ roomId }) => {
            if (!rooms[roomId]) rooms[roomId] = [];

            // Prevent duplicates
            if (!rooms[roomId].includes(socket.id)) {
                rooms[roomId].push(socket.id);
            }

            socket.join(roomId);
            console.log(`🎥 ${socket.user.name} joined VIDEO room: ${roomId}`);

            // A. Tell the NEW user who is already there
            const otherUsers = rooms[roomId].filter((id) => id !== socket.id);
            socket.emit("all-users", { users: otherUsers });

            // B. Tell EXISTING users that a new person joined
            socket.to(roomId).emit("user-joined", {
                socketId: socket.id,
                userName: socket.user.name
            });
        });

        // ==========================================
        // 4️⃣ VIDEO: OFFER (Signaling)
        // ==========================================
        socket.on("offer", ({ target, offer }) => {
            io.to(target).emit("offer", {
                caller: socket.id, // The ID of the person making the offer
                offer
            });
        });

        // ==========================================
        // 5️⃣ VIDEO: ANSWER (Signaling)
        // ==========================================
        socket.on("answer", ({ target, answer }) => {
            io.to(target).emit("answer", {
                from: socket.id, // <--- CRITICAL FIX: Frontend needs to know who answered
                answer
            });
        });

        // ==========================================
        // 6️⃣ VIDEO: ICE CANDIDATE (Signaling)
        // ==========================================
        socket.on("ice-candidate", ({ target, candidate }) => {
            io.to(target).emit("ice-candidate", {
                from: socket.id, // <--- CRITICAL FIX: Frontend needs to know who sent this
                candidate
            });
        });

        // ==========================================
        // 7️⃣ DISCONNECT HANDLER
        // ==========================================
        socket.on("disconnect", () => {
            console.log(`❌ Disconnected: ${socket.user.name}`);

            // Remove user from all video rooms they were part of
            Object.keys(rooms).forEach((roomId) => {
                if (rooms[roomId].includes(socket.id)) {
                    // Remove ID from array
                    rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

                    // Notify remaining users in that room
                    socket.to(roomId).emit("user-left", socket.id);
                }
            });
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO };