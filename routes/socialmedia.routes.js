module.exports = (app) => {
  const { SocialMedia } = require('../models');

  // Get all social media entries
  app.get('/socialmedia', async (req, res) => {
    try {
      const list = await SocialMedia.findAll();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Get social media by ID (primary key)
  app.get('/socialmedia/:id', async (req, res) => {
    try {
      const sm = await SocialMedia.findByPk(req.params.id);
      if (!sm) return res.status(404).json({ message: 'Not found' });
      res.json(sm);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Get social media by userId
  app.get('/socialmedia/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const data = await SocialMedia.findOne({ where: { userId } });

      if (!data) return res.status(404).json({ message: 'No social info found for this user' });

      res.json(data);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Create new social media entry
  app.post('/socialmedia', async (req, res) => {
    try {
      const sm = await SocialMedia.create(req.body);
      res.status(201).json(sm);
    } catch (err) {
      res.status(400).json({ message: 'Bad request', error: err.message });
    }
  });

  // ✅ Update social media by userId in request body
  app.put('/socialmedia', async (req, res) => {
    try {
      const { userId, ...fields } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId is required' });

      const sm = await SocialMedia.findOne({ where: { userId } });
      if (!sm) return res.status(404).json({ message: 'Not found' });

      await sm.update(fields);
      res.json(sm);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Delete social media by ID
  app.delete('/socialmedia/:id', async (req, res) => {
    try {
      const sm = await SocialMedia.findByPk(req.params.id);
      if (!sm) return res.status(404).json({ message: 'Not found' });
      await sm.destroy();
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
};
