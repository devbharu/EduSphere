// models/Pdf.js
const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: String,
        default: "admin"
    }
}, {
    timestamps: true  // This adds createdAt and updatedAt automatically
});

// ✅ CRITICAL: Use module.exports, NOT exports.default
module.exports = mongoose.model("Pdf", pdfSchema);