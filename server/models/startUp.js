const mongoose = require('mongoose');
const { Schema } = mongoose;

const StartUpSchema = new Schema(
  {
    // Reference to the owner/creator user (unique - one startup per user)
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic startup metadata
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Owner Email field
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, trim: true },

    // Optional extensible metadata
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StartUp', StartUpSchema);
