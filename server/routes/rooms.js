const express = require("express");
const router = express.Router();
const Room = require("../models/rooms");
const auth = require("../middleware/auth");
const { getIO } = require("../socket/index");

// Create Room
router.post("/", auth, async (req, res) => {
    const { name } = req.body; // Removed 'members' input from body, we add creator automatically

    try {
        const room = await Room.create({
            name,
            members: [req.user.id], // Creator is the first member
        });

        // BROADCAST TO EVERYONE
        const io = getIO();
        if (io) {
            io.emit("room_added", room);
        }

        res.status(201).json(room);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// CHANGE 1: Get ALL Rooms (So everyone can see created classes)
router.get("/all", auth, async (req, res) => {
    try {
        // Fetch all rooms, sort by newest
        const rooms = await Room.find({}).sort({ createdAt: -1 });
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;