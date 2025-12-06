const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");

// --- Routes ---
const studentRoutes = require("./routes/user");
const startUpRoutes = require('./routes/startUpRoutes');
const chatRoutes = require('./routes/chat');
const roomRoutes = require('./routes/rooms');
const notesRoutes = require("./routes/Notes.js");

// Live Class Routes (New)
const liveClassRoutes = require('./routes/liveClasses');

// Assessment Routes (New)
const assesmentRoutes = require('./routes/assesmentRoutes');
const assesmentUserRoutes = require('./routes/assesmentUserRoutes');

// Socket
const { initSocket } = require("./socket/index");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// CORS for Express (HTTP Routes)
app.use(cors({
    origin: "*", // Allow all origins for now (Change to specific frontend URL in production)
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// --- Public Routes / General API Routes ---
app.use("/api/auth", studentRoutes);
app.use('/api/startUp', startUpRoutes);

// Assessment Routes
app.use('/api/assessments', assesmentRoutes);
app.use('/api/assessment-users', assesmentUserRoutes);

// Protected sample route
app.get("/protected", auth, (req, res) => {
    res.json({ message: "Authenticated ✔", user: req.user });
});

// --- Chat, Rooms, Live Classes & Notes Routes (Protected implicitly by subsequent middleware if applied) ---
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/liveClasses", liveClassRoutes); // Live Class Route

// Base route
app.get("/", (req, res) => res.send("API is running ✔"));

// Start server
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Initialize socket
// This sets up the 'io' variable inside socket/index.js
// So when route handlers call getIO(), it finds the active instance.
initSocket(server);