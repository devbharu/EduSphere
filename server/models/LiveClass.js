const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Students", // References your Student/User Model
        required: true
    },
    teacherName: {
        type: String,

    },
    // The MongoDB _id will serve as the unique roomId for the video call.
}, { timestamps: true });

module.exports = mongoose.model("LiveClass", liveClassSchema);