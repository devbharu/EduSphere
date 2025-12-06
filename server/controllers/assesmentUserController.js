const AssesmentUser = require('../models/assesmentUser');
const Assesment = require('../models/assesment');

/**
 * Create or update a student's assessment result
 * body: { assesmentId, studentId, marks, timeTaken (optional) }
 */
exports.createAssesmentUser = async (req, res) => {
  try {
    const { assesmentId, studentId, marks, timeTaken } = req.body;
    if (!assesmentId || !studentId || typeof marks !== 'number') {
      return res.status(400).json({ error: 'assesmentId, studentId and numeric marks are required' });
    }

    // Optional: validate assesment exists
    const assesmentExists = await Assesment.findById(assesmentId);
    if (!assesmentExists) return res.status(404).json({ error: 'Assessment not found' });

    // Prepare update data
    const updateData = { marks };
    if (timeTaken) {
      updateData.timeTaken = timeTaken;
    }

    // Upsert: ensure single record per student per assessment
    const record = await AssesmentUser.findOneAndUpdate(
      { assesmentId, studentId },
      updateData,
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
      .sort({ createdAt: -1 })

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
      .sort({ marks: -1, createdAt: -1 });

    return res.json({ success: true, records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get a student's result for a specific assessment
 * params: assesmentId, studentId
 */
exports.getAssessmentResult = async (req, res) => {
  try {
    const { assesmentId, studentId } = req.params;
    if (!assesmentId || !studentId) return res.status(400).json({ error: 'assesmentId and studentId required' });

    const record = await AssesmentUser.findOne({ assesmentId, studentId })
      .populate('assesmentId', 'heading topic questions');
    
    if (!record) return res.status(404).json({ error: 'Result not found' });

    return res.json({ 
      success: true, 
      record: record.toObject()
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all assessments for a student (raw data, no populate)
 * This will be used for AI recommendations
 * params: studentId
 */
exports.getStudentAssessmentsRaw = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    // Fetch assessments without populate
    const records = await AssesmentUser.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    if (!records || records.length === 0) {
      return res.status(404).json({ 
        error: 'No assessments found. Complete some assessments first to get recommendations.' 
      });
    }

    // Now fetch the assessment details separately
    const assessmentIds = records.map(r => r.assesmentId);
    const assessments = await Assesment.find({ _id: { $in: assessmentIds } })
      .select('heading topic questions')
      .lean();

    // Create a map for quick lookup
    const assessmentMap = {};
    assessments.forEach(a => {
      assessmentMap[a._id.toString()] = a;
    });

    // Combine the data
    const combinedData = records.map(record => {
      const assessment = assessmentMap[record.assesmentId.toString()] || {};
      return {
        marks: record.marks || 0,
        timeTaken: record.timeTaken || 'N/A',
        completedAt: record.createdAt,
        topic: assessment.topic || 'Unknown Topic',
        heading: assessment.heading || 'Untitled',
        totalQuestions: assessment.questions ? assessment.questions.length : 0
      };
    });

    return res.json({
      success: true,
      assessments: combinedData
    });

  } catch (err) {
    console.error('Error fetching student assessments:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch assessments' 
    });
  }
};