const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/messages");
const auth = require("../middleware/auth");

// Get messages for a room
router.get("/rooms/:roomId/messages", auth, async (req, res) => {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
    }

    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    try {
        const messages = await Message.find({ roomId })
            .sort({ createdAt: 1 })
            .skip(offset)
            .limit(limit);

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Send message
router.post("/rooms/:roomId/messages", auth, async (req, res) => {
    const { roomId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message required" });
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
    }

    try {
        const newMessage = await Message.create({
            roomId,
            senderId: req.user.id,
            senderName: req.user.name,
            message,
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
