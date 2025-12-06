const mongoose = require('mongoose');

const AssesmentUserSchema = new mongoose.Schema({
  assesmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assesment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  marks: { type: Number, required: true, min: 0 }
}, { timestamps: true });

AssesmentUserSchema.index({ assesmentId: 1, studentId: 1 }, { unique: true }); // optional: one record per student per assessment

module.exports = mongoose.model('AssesmentUser', AssesmentUserSchema);