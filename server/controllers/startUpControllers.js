const StartUp = require('../models/startUp');

/**
 * Get current user's startup (authenticated)
 */
async function getMyStartUp(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    // console.log(userId)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const startup = await StartUp.findOne({ user: userId });
    return res.status(200).json({ success: true, data: startup });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Create a new startup.
 * Expects req.user to exist (authenticated user).
 * Only allows one startup per user.
 */
async function createStartUp(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    // Check if user already has a startup
    const existingStartup = await StartUp.findOne({ user: userId });
    if (existingStartup) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a startup registered. Please update it instead.' 
      });
    }

    const { name, description, ownerName, ownerEmail, meta } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!ownerName) {
      return res.status(400).json({ success: false, message: 'Owner name is required' });
    }
    if (!ownerEmail) {
      return res.status(400).json({ success: false, message: 'Owner email is required' });
    }

    const startup = new StartUp({
      user: userId,
      name,
      description,
      ownerName,
      ownerEmail,
      meta
    });

    await startup.save();
    return res.status(201).json({ success: true, data: startup });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You already have a startup registered' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update startup fields (owner only).
 */
async function updateStartUp(req, res) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { id } = req.params;
    const startup = await StartUp.findById(id);
    
    if (!startup) {
      return res.status(404).json({ success: false, message: 'StartUp not found' });
    }
    
    if (String(startup.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own startup' });
    }

    const { name, description, ownerName, ownerEmail, meta } = req.body;
    if (name !== undefined) startup.name = name;
    if (description !== undefined) startup.description = description;
    if (ownerName !== undefined) startup.ownerName = ownerName;
    if (ownerEmail !== undefined) startup.ownerEmail = ownerEmail;
    if (meta !== undefined) startup.meta = meta;

    await startup.save();
    return res.status(200).json({ success: true, data: startup });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get all startups (public access).
 */
async function getAllStartUps(req, res) {
  try {
    const startups = await StartUp.find().populate('user', 'name email').sort({ createdAt: -1 });
    // console.log(startups)
    return res.status(200).json({ success: true, data: startups });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getMyStartUp,
  createStartUp,
  updateStartUp,
  getAllStartUps
};
