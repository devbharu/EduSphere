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
const liveClassRoutes = require('./routes/liveClasses');
const assesmentRoutes = require('./routes/assesmentRoutes');
const assesmentUserRoutes = require('./routes/assesmentUserRoutes');

// ⭐ ADDED
const pdfRoutes = require("./routes/pdfRoutes");

const { initSocket } = require("./socket/index");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ⭐ ADDED - Serve PDF files
app.use("/uploads", express.static("uploads"));

// --- Public Routes ---
app.use("/api/auth", studentRoutes);
app.use('/api/startUp', startUpRoutes);

// Assessment
app.use('/api/assessments', assesmentRoutes);
app.use('/api/assessment-users', assesmentUserRoutes);

// Protected sample
app.get("/protected", auth, (req, res) => {
    res.json({ message: "Authenticated ✔", user: req.user });
});

// Chat, Rooms, Notes, Live Classes
app.use("/api/chat", chatRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/liveClasses", liveClassRoutes);

// ⭐ ADDED - PDF Management Routes
app.use("/api/pdfs", pdfRoutes);

// Base
app.get("/", (req, res) => res.send("API is running ✔"));

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Initialize socket
initSocket(server);
