const express = require("express");
const router = express.Router();
const LiveClass = require("../models/LiveClass"); // Your new model
const auth = require("../middleware/auth"); // Your existing auth middleware
const { getIO } = require("../socket/index"); // Socket for real-time updates

// ==========================================
// A. CREATE A NEW LIVE CLASS ROOM (POST /api/liveClasses/create)
// ==========================================
router.post("/create", auth, async (req, res) => {
    // Requires title and subject input from the frontend form
    const { title, subject } = req.body;

    if (!title || !subject) {
        return res.status(400).json({ message: "Title and Subject are required to create a class." });
    }

    try {
        // Create new Live Class record in the database
        const newClass = await LiveClass.create({
            title,
            subject,
            teacher: req.user._id, // Set by the 'auth' middleware
            teacherName: req.user.name,
        });

        // ⚡ REAL-TIME UPDATE: Notify all connected dashboards instantly
        try {
            const io = getIO();
            if (io) {
                // Emitting a specific event for Live Classes to avoid confusion with chat rooms
                io.emit("live_class_added", newClass);
            }
        } catch (socketError) {
            console.warn("Could not emit live_class_added socket event:", socketError.message);
        }

        res.status(201).json({
            success: true,
            class: newClass,
            message: "Live Class created successfully"
        });

    } catch (error) {
        console.error("Create Live Class Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ==========================================
// B. GET ALL LIVE CLASSES (GET /api/liveClasses)
// ==========================================
router.get("/", auth, async (req, res) => {
    try {
        // Fetch all classes, sort by newest first
        const classes = await LiveClass.find({})
            .sort({ createdAt: -1 });

        res.status(200).json(classes);

    } catch (error) {
        console.error("Get Live Classes Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;