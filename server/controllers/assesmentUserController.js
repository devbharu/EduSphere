const AssesmentUser = require('../models/assesmentUser');
const Assesment = require('../models/assesment');

/**
 * Create or update a student's assessment result
 * body: { assesmentId, studentId, marks }
 */
exports.createAssesmentUser = async (req, res) => {
  try {
    const { assesmentId, studentId, marks } = req.body;
    if (!assesmentId || !studentId || typeof marks !== 'number') {
      return res.status(400).json({ error: 'assesmentId, studentId and numeric marks are required' });
    }

    // Optional: validate assesment exists
    const assesmentExists = await Assesment.findById(assesmentId);
    if (!assesmentExists) return res.status(404).json({ error: 'Assessment not found' });

    // Upsert: ensure single record per student per assessment
    const record = await AssesmentUser.findOneAndUpdate(
      { assesmentId, studentId },
      { marks },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ success: true, record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all assessment results for a given studentId
 * query param or url param: studentId
 */
exports.getAssessmentsByUserId = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.query.studentId;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });

    const records = await AssesmentUser.find({ studentId })
      .populate('assesmentId', 'heading topic questions')
      .lean();

    return res.json({ success: true, records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all student results for a specific assessment
 * params: assessmentId
 */
exports.getResultsByAssessmentId = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    if (!assessmentId) return res.status(400).json({ error: 'assessmentId is required' });

    const records = await AssesmentUser.find({ assesmentId: assessmentId })
      .sort({ createdAt: -1 });


      // console.log(records)

    return res.json({ success: true, records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Optional: Get a student's result for a specific assessment
 * params: assesmentId, studentId
 */
exports.getAssessmentResult = async (req, res) => {
  try {
    const { assesmentId, studentId } = req.params;
    if (!assesmentId || !studentId) return res.status(400).json({ error: 'assesmentId and studentId required' });

    const record = await AssesmentUser.findOne({ assesmentId, studentId }).populate('assesmentId', 'heading topic');
    if (!record) return res.status(404).json({ error: 'Result not found' });

    return res.json({ success: true, record });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};