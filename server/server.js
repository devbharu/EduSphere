const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");

// Routes
const studentRoutes = require("./routes/user");
const auth = require("./middleware/auth");
const startUpRoutes = require('./routes/startUpRoutes')

// Socket
const { initSocket } = require("./socket/index");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// CORS for Express (HTTP Routes)
// Note: Socket.io CORS is handled inside socket/index.js
app.use(cors({
    origin: "*", // Allow all origins for now (Change to specific frontend URL in production)
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api/auth", studentRoutes);
app.use('/api/startUp', startUpRoutes)

// Protected sample route
app.get("/protected", auth, (req, res) => {
    res.json({ message: "Authenticated ✔", user: req.user });
});

// Chat & rooms routes
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);

// Base route
app.get("/", (req, res) => res.send("API is running ✔"));

// Start server
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Initialize socket
// This sets up the 'io' variable inside socket/index.js
// So when /api/rooms calls getIO(), it finds the active instance.
initSocket(server);