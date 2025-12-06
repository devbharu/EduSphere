const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: {
    type: [OptionSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length === 4,
      message: 'Each question must have exactly 4 options'
    },
    required: true
  },
  correctAnswer: {
    // store index (0-3) of correct option to avoid duplication
    type: Number,
    required: true,
    min: 0,
    max: 3
  }
}, { _id: false });

const AssesmentSchema = new mongoose.Schema({
  heading: { type: String, required: true, trim: true },
  topic: { type: String, required: true, trim: true },
  questions: {
    type: [QuestionSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'Assessment must contain at least one question'
    },
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Assesment', AssesmentSchema);