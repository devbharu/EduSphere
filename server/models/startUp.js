const mongoose = require('mongoose');
const { Schema } = mongoose;

const StartUpSchema = new Schema(
  {
    // Reference to the owner/creator user
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Array of references to Investor documents
    investors: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Basic startup metadata
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Optional extensible metadata
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StartUp', StartUpSchema);