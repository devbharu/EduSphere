const StartUp = require('../models/startUp');

/**
 * Create a new startup.
 * Expects req.user to exist (authenticated user).
 * Body: { name, description?, ownerEmail, meta? }
 */
async function createStartUp(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { name, description, ownerEmail, meta } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!ownerEmail) return res.status(400).json({ error: 'Owner email is required' });

    const startup = new StartUp({
      user: userId,
      name,
      description,
      ownerEmail,
      meta
    });

    await startup.save();
    return res.status(201).json(startup);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate startup' });
    return next(err);
  }
}

/**
 * Update startup fields (owner only).
 * Params: :id
 * Body: { name?, description?, ownerEmail?, meta? }
 */
async function updateStartUp(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { id } = req.params;
    const startup = await StartUp.findById(id);
    if (!startup) return res.status(404).json({ error: 'StartUp not found' });
    if (String(startup.user) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, description, ownerEmail, meta } = req.body;
    if (name !== undefined) startup.name = name;
    if (description !== undefined) startup.description = description;
    if (ownerEmail !== undefined) startup.ownerEmail = ownerEmail;
    if (meta !== undefined) startup.meta = meta;

    await startup.save();
    return res.status(200).json(startup);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate startup' });
    return next(err);
  }
}

/**
 * Get all startups (public access).
 */
async function getAllStartUps(req, res, next) {
  try {
    const startups = await StartUp.find().sort({ createdAt: -1 });
    return res.status(200).json(startups);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createStartUp,
  updateStartUp,
  getAllStartUps,
};
