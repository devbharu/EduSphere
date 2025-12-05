const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Routes
const studentRoutes = require("./routes/user");
const auth = require("./middleware/auth");

// SOCKET
const http = require("http");
const { initSocket } = require("./socket/index");

dotenv.config();
const app = express();
const server = http.createServer(app); // <-- IMPORTANT

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Public Routes
app.use("/api/auth", studentRoutes);

// Protected Sample Route
app.get("/protected", auth, (req, res) => {
    res.json({ message: "Authenticated ✔", user: req.user });
});

// Base Route
app.get("/", (req, res) => {
    res.send("API is running ✔");
});

// DB connect
connectDB();

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

// SOCKET INITIALIZE
initSocket(server);
