const mongoose = require('mongoose');

// --- Sub-Schemas for Editor.js Structure ---

// Schema for individual blocks (paragraph, header, list, etc.)
const BlockSchema = new mongoose.Schema(
    {
        id: String,
        type: String,
        data: mongoose.Schema.Types.Mixed, // Allows flexible data for different block types
    },
    { _id: false } // Prevent Mongoose from creating _id for every block
);

// Schema for the overall Editor.js output object
const DocsContentSchema = new mongoose.Schema(
    {
        time: Number,
        blocks: [BlockSchema],
        version: String,
    },
    { _id: false }
);

// --- Main Note Schema ---

const NoteSchema = new mongoose.Schema(
    {
        // Connection to the User (Student) model
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',

        },
        title: {
            type: String,
            trim: true,
            default: 'Untitled'
        },
        description: {
            type: String,
            default: ''
        },
        // structured content
        content: {
            type: DocsContentSchema,
            default: { time: Date.now(), blocks: [], version: '2.30.0' }
        },

        // Sharing capabilities
        shared: {
            type: Boolean,
            default: false
        },
        shareId: {
            type: String,
            unique: true,
            sparse: true // Allows multiple documents to have null shareId
        },
    },
    {
        timestamps: true // Automatically handles createdAt and updatedAt
    }
);

module.exports = mongoose.model('Note', NoteSchema);