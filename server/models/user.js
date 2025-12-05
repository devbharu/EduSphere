const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },
    role: {
        type: String,
        enum: ["student", "teacher", "investor"],
        default: "student"
    }
}, { timestamps: true });

module.exports = mongoose.model("Students", studentSchema);
