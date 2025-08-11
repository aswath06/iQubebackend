module.exports = (app) => {
  const { Note } = require('../models');

  app.get('/notes', async (req, res) => {
    try {
      const notes = await Note.findAll();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  });

  app.get('/notes/:id', async (req, res) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) return res.status(404).json({ message: 'Not found' });
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  });

  app.post('/notes', async (req, res) => {
    try {
      const note = await Note.create(req.body);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create note' });
    }
  });

  app.put('/notes/:id', async (req, res) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) return res.status(404).json({ message: 'Not found' });
      await note.update(req.body);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update note' });
    }
  });

  app.delete('/notes/:id', async (req, res) => {
    try {
      const note = await Note.findByPk(req.params.id);
      if (!note) return res.status(404).json({ message: 'Not found' });
      await note.destroy();
      res.json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });
};
