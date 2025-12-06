const express = require('express');
const router = express.Router();
const assesmentCtrl = require('../controllers/assesmentController');

// Create assessment
router.post('/', assesmentCtrl.createAssesment);

// Update assessment
router.put('/:id', assesmentCtrl.updateAssesment);

// Delete assessment
router.delete('/:id', assesmentCtrl.deleteAssesment);

// Optional: get by id
router.get('/:id', assesmentCtrl.getAssesmentById);

module.exports = router;