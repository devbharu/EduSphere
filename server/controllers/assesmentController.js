const Assesment = require('../models/assesment');

/**
 * Get all assessments
 */
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assesment.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, assessments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Create a new assessment
 * body: { heading, topic, questions: [{ questionText, options: [{text},..4], correctAnswer }] }
 */
exports.createAssesment = async (req, res) => {
  try {
    const { heading, topic, questions } = req.body;
    if (!heading || !topic || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'heading, topic and questions are required' });
    }

    const assesment = new Assesment({ heading, topic, questions });
    await assesment.save();
    return res.status(201).json({ success: true, assesment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update an assessment by id
 * params: id
 * body: any of { heading, topic, questions }
 */
exports.updateAssesment = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const assesment = await Assesment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!assesment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json({ success: true, assesment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete assessment by id
 */
exports.deleteAssesment = async (req, res) => {
  try {
    const { id } = req.params;
    const assesment = await Assesment.findByIdAndDelete(id);
    if (!assesment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json({ success: true, message: 'Assessment deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get assessment by id
 */
exports.getAssesmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assesment = await Assesment.findById(id);
    if (!assesment) return res.status(404).json({ error: 'Assessment not found' });
    return res.json({ success: true, assesment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};