const express = require("express");
const { signUp, signIn, getProfile, updateProfile } = require("../controllers/user");
const auth = require("../middleware/auth");

const router = express.Router();

// Public
router.post("/register", signUp);
router.post("/login", signIn);

// Protected
router.get("/profile", auth, getProfile);
router.put("/update", auth, updateProfile);

module.exports = router;
