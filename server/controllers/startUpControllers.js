const StartUp = require('../models/startUp');

/**
 * Create a new startup.
 * Expects req.user to exist (authenticated user).
 * Body: { name, description?, meta? }
 */
async function createStartUp(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { name, description, meta } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const startup = new StartUp({ user: userId, name, description, meta });
    await startup.save();
    return res.status(201).json(startup.toJSON ? startup.toJSON() : startup);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate startup' });
    return next(err);
  }
}

/**
 * Update startup fields (owner only).
 * Params: :id
 * Body: { name?, description?, meta? }
 */
async function updateStartUp(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { id } = req.params;
    const startup = await StartUp.findById(id);
    if (!startup) return res.status(404).json({ error: 'StartUp not found' });
    if (String(startup.user) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });

    const { name, description, meta } = req.body;
    if (name !== undefined) startup.name = name;
    if (description !== undefined) startup.description = description;
    if (meta !== undefined) startup.meta = meta;

    await startup.save();
    return res.status(200).json(startup.toJSON ? startup.toJSON() : startup);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Duplicate startup' });
    return next(err);
  }
}

/**
 * Add investor to a startup (owner only).
 * Params: :id
 * Body: { investorId }
 */
async function addInvestor(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { id } = req.params;
    const { investorId } = req.body;
    if (!investorId) return res.status(400).json({ error: 'investorId is required' });

    const startup = await StartUp.findById(id);
    if (!startup) return res.status(404).json({ error: 'StartUp not found' });
    if (String(startup.user) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });

    const exists = startup.investors.map(i => String(i)).includes(String(investorId));
    if (!exists) {
      startup.investors.push(investorId);
      await startup.save();
    }

    const populated = await StartUp.findById(id).populate('investors');
    return res.status(200).json(populated.toJSON ? populated.toJSON() : populated);
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove investor from a startup (owner only).
 * Params: :id
 * Body: { investorId }
 */
async function removeInvestor(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { id } = req.params;
    const { investorId } = req.body;
    if (!investorId) return res.status(400).json({ error: 'investorId is required' });

    const startup = await StartUp.findById(id);
    if (!startup) return res.status(404).json({ error: 'StartUp not found' });
    if (String(startup.user) !== String(userId)) return res.status(403).json({ error: 'Forbidden' });

    startup.investors = startup.investors.filter(i => String(i) !== String(investorId));
    await startup.save();

    const populated = await StartUp.findById(id).populate('investors');
    return res.status(200).json(populated.toJSON ? populated.toJSON() : populated);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get a startup by id (populates investors and owner).
 * Params: :id
 */
async function getStartUp(req, res, next) {
  try {
    const { id } = req.params;
    const startup = await StartUp.findById(id).populate('investors user');
    if (!startup) return res.status(404).json({ error: 'StartUp not found' });
    return res.status(200).json(startup.toJSON ? startup.toJSON() : startup);
  } catch (err) {
    return next(err);
  }
}

/**
 * List startups for authenticated user.
 */
async function listUserStartUps(req, res, next) {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const startups = await StartUp.find({ user: userId }).populate('investors');
    return res.status(200).json(startups.map(s => (s.toJSON ? s.toJSON() : s)));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createStartUp,
  updateStartUp,
  addInvestor,
  removeInvestor,
  getStartUp,
  listUserStartUps,
};