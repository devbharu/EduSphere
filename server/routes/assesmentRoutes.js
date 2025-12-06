const express = require('express');
const router = express.Router();
const assesmentCtrl = require('../controllers/assesmentController');

// Get all assessments
router.get('/', assesmentCtrl.getAllAssessments);

// Get assessment by id (must be after '/' route)
router.get('/:id', assesmentCtrl.getAssesmentById);

// Create assessment
router.post('/', assesmentCtrl.createAssesment);

// Update assessment
router.put('/:id', assesmentCtrl.updateAssesment);

// Delete assessment
router.delete('/:id', assesmentCtrl.deleteAssesment);

module.exports = router;