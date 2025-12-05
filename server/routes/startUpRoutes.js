const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/startUpControllers');

// try to load an auth middleware if present, otherwise use a noop
let auth;
try {
  auth = require('../middleware/auth');
} catch (e) {
  auth = (req, res, next) => next();
}

// Create a startup (authenticated)
router.post('/', auth, ctrl.createStartUp);

// List startups for authenticated user
router.get('/', auth, ctrl.listUserStartUps);

// Get a startup by id (public)
router.get('/:id', ctrl.getStartUp);

// Update a startup (owner only, authenticated)
router.put('/:id', auth, ctrl.updateStartUp);

// Add investor to a startup (owner only, authenticated)
router.post('/:id/investors', auth, ctrl.addInvestor);

// Remove investor from a startup (owner only, authenticated)
router.delete('/:id/investors', auth, ctrl.removeInvestor);

module.exports = router;