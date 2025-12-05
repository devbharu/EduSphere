const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Assuming this is your token verification middleware
const {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    shareNote,
    getSharedNote
} = require("../controllers/noteController");

// --- PUBLIC ROUTES ---
router.get("/shared/:shareId", getSharedNote);

// --- PROTECTED ROUTES ---
// Apply the auth middleware to all routes below
router.use(auth);

router.get("/", getNotes);
router.get("/get/:id", getNote);
router.post("/add", createNote);
router.put("/update/:id", updateNote);
router.delete("/delete/:id", deleteNote);
router.post("/share/:id", shareNote);

// Use module.exports for CommonJS compatibility
module.exports = router;