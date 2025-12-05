const mongoose = require("mongoose");
const crypto = require("crypto");
const Note = require("../models/Note");
const Student = require("../models/user");

// Helper to validate MongoDB IDs
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Get all notes for the logged-in student
exports.getNotes = async (req, res) => {
    try {
        const studentId = req.user._id; // Assumes auth middleware populates req.user

        const notes = await Note.find({ user: studentId })
            .sort({ updatedAt: -1 })
            .select("title content updatedAt shared shareId"); // Select 'shared', not 'isShared'

        res.status(200).json({ ok: true, notes });
    } catch (error) {
        console.error("Error in getNotes:", error);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};

// 2. Get single note details (Private)
exports.getNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const studentId = req.user._id;

        if (!isValidId(noteId)) {
            return res.status(400).json({ ok: false, error: "Invalid Note ID" });
        }

        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({ ok: false, error: "Note not found" });
        }

        // Ownership check
        if (note.user.toString() !== studentId.toString()) {
            return res.status(403).json({ ok: false, error: "You are not authorized to view this note" });
        }

        res.status(200).json({ ok: true, note });
    } catch (error) {
        console.error("Error in getNote:", error);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};

// 3. Create a new note
exports.createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const studentId = req.user._id;

        // Default content structure for Editor.js if not provided
        const defaultContent = {
            time: Date.now(),
            blocks: [],
            version: '2.30.0'
        };

        const newNote = new Note({
            title: title || "Untitled",
            content: content || defaultContent,
            user: studentId,
            shared: false // DB field is 'shared'
        });

        const savedNote = await newNote.save();

        res.status(201).json({ ok: true, message: "Note created successfully", note: savedNote });
    } catch (error) {
        console.error("Error in createNote:", error);
        res.status(400).json({ ok: false, error: error.message });
    }
};

// 4. Update a note
exports.updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const studentId = req.user._id;
        const { title, content } = req.body;

        if (!isValidId(noteId)) {
            return res.status(400).json({ ok: false, error: "Invalid Note ID" });
        }

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ ok: false, error: "Note not found" });

        // Ownership check
        if (note.user.toString() !== studentId.toString()) {
            return res.status(403).json({ ok: false, error: "You are not allowed to update this note" });
        }

        if (title !== undefined) note.title = title;

        // Ensure content updates respect the schema structure
        if (content !== undefined) {
            note.content = content;
            // Depending on Mongoose version, you might need to mark mixed/nested fields as modified
            note.markModified('content');
        }

        // updatedAt is handled automatically by timestamps: true in schema, 
        // but we can force it if needed:
        // note.updatedAt = Date.now();

        await note.save();
        res.status(200).json({ ok: true, message: "Note updated successfully", note });
    } catch (error) {
        console.error("Error in updateNote:", error);
        res.status(400).json({ ok: false, error: error.message });
    }
};

// 5. Delete a note
exports.deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const studentId = req.user._id;

        if (!isValidId(noteId)) {
            return res.status(400).json({ ok: false, error: "Invalid Note ID" });
        }

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ ok: false, error: "Note not found" });

        if (note.user.toString() !== studentId.toString()) {
            return res.status(403).json({ ok: false, error: "You are not allowed to delete this note" });
        }

        await note.deleteOne();
        res.status(200).json({ ok: true, message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error in deleteNote:", error);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};

// 6. Share a note (Toggle Public/Private)
exports.shareNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const studentId = req.user._id;

        // Frontend sends 'isShared', Schema uses 'shared'
        const { isShared } = req.body;

        if (!isValidId(noteId)) {
            return res.status(400).json({ ok: false, error: "Invalid Note ID" });
        }

        const note = await Note.findById(noteId);
        if (!note) return res.status(404).json({ ok: false, error: "Note not found" });

        if (note.user.toString() !== studentId.toString()) {
            return res.status(403).json({ ok: false, error: "You are not allowed to share this note" });
        }

        // Generate ID if sharing is turned ON and ID doesn't exist
        if (isShared && !note.shareId) {
            note.shareId = crypto.randomBytes(16).toString("hex");
        }

        // Update the DB field 'shared'
        note.shared = !!isShared;

        await note.save();

        res.status(200).json({
            ok: true,
            message: note.shared ? "Note is now public" : "Note is now private",
            isShared: note.shared, // Send back 'isShared' to match frontend expectation
            shareId: note.shared ? note.shareId : null
        });
    } catch (error) {
        console.error("Error in shareNote:", error);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};

// 7. Get Public Shared Note (No Auth Required)
exports.getSharedNote = async (req, res) => {
    try {
        const { shareId } = req.params;

        // Query based on 'shareId' and 'shared: true'
        const note = await Note.findOne({ shareId, shared: true }).select(
            "title content updatedAt user"
        ).populate("user", "name email");

        if (!note) {
            return res.status(404).json({ ok: false, error: "Shared note not found or not public" });
        }

        res.status(200).json({ ok: true, note });
    } catch (error) {
        console.error("Error in getSharedNote:", error);
        res.status(500).json({ ok: false, error: "Server error" });
    }
};