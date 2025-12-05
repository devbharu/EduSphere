const Student = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// 📌 SIGN UP
const signUp = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await Student.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 🔐 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Student.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        console.error("SignUp Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// 📌 SIGN IN
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await Student.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔐 Validate password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        console.error("SignIn Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// 📌 GET USER PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await Student.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User profile fetched",
            user
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 📌 UPDATE USER DETAILS
const updateProfile = async (req, res) => {
    try {
        const { name, role } = req.body;

        const updatedUser = await Student.findByIdAndUpdate(
            req.user.id,
            { name, role },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { signUp, signIn, getProfile, updateProfile };

