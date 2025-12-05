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

// Get all startups (public access)
router.get('/', ctrl.getAllStartUps);

// Get current user's startup (authenticated)
router.get('/my-startup', auth, ctrl.getMyStartUp);

// Create a startup (authenticated)
router.post('/', auth, ctrl.createStartUp);

// Update a startup (owner only, authenticated)
router.put('/:id', auth, ctrl.updateStartUp);

module.exports = router;