const express = require('express');
const router = express.Router();
const assesmentUserCtrl = require('../controllers/assesmentUserController');

// Create or update user's assessment result
router.post('/', assesmentUserCtrl.createAssesmentUser);

// Get all assessment results for a student
router.get('/user/:studentId', assesmentUserCtrl.getAssessmentsByUserId);

// Get all student results for a specific assessment (NEW)
router.get('/assessment/:assessmentId', assesmentUserCtrl.getResultsByAssessmentId);

// Get specific result (assessment + student)
router.get('/:assesmentId/user/:studentId', assesmentUserCtrl.getAssessmentResult);

module.exports = router;