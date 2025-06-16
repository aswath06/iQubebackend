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

  // Get social media by primary key (id)
  app.get('/socialmedia/:id', async (req, res) => {
    try {
      const sm = await SocialMedia.findByPk(req.params.id);
      if (!sm) return res.status(404).json({ message: 'Not found' });
      res.json(sm);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // ✅ Get social media info by userId
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

  // Update social media by id
  app.put('/socialmedia/:id', async (req, res) => {
    try {
      const sm = await SocialMedia.findByPk(req.params.id);
      if (!sm) return res.status(404).json({ message: 'Not found' });
      await sm.update(req.body);
      res.json(sm);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Delete social media by id
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
