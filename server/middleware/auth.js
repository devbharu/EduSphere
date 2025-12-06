// middleware/auth.js

const jwt = require("jsonwebtoken");
const User = require("../models/user"); // <--- ASSUME your User model is here

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Check for token presence and format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 2. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch the full user document from the database
        //    'id' is the field the JWT payload should contain (your MongoDB _id).
        const user = await User.findById(decoded.id).select('-password'); // Exclude password for security

        if (!user) {
            // User was found in token payload but not in database (e.g., account deleted)
            return res.status(401).json({ message: "Invalid token: User not found." });
        }

        // 4. Attach the full, current user object to the request
        //    This fixes the `req.user.name` and `req.user._id` errors in your routes.
        req.user = user;

        next();
    } catch (error) {
        // Handle token expiration, malformed token, or JWT verification failure
        console.error("JWT Authentication Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};