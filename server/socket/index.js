// socket/index.js
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // or your frontend URL
            methods: ["GET", "POST"]
        }
    });

    // SOCKET AUTH + CONNECTION
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            console.log("❌ No token provided");
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // { id, role }
            socket.join(decoded.id); // JOIN personal user room
            next();
        } catch (err) {
            console.log("❌ Invalid token", err.message);
            return next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`✅ User Connected: ${socket.user.id} | Socket ID: ${socket.id}`);

        // LISTEN for events
        socket.on("send_message", (data) => {
            console.log("📨 Message received:", data);

            // Send to specific user
            if (data.to) {
                io.to(data.to).emit("receive_message", {
                    from: socket.user.id,
                    message: data.message,
                });
            }
        });

        // NOTIFICATION EVENT
        socket.on("notify", (data) => {
            console.log("🔔 Sending notification:", data);
            io.to(data.to).emit("notification", {
                title: data.title,
                content: data.content,
                from: socket.user.id
            });
        });

        // DISCONNECT
        socket.on("disconnect", () => {
            console.log(`❌ Socket Disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
