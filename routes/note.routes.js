module.exports = (app) => {
  const { Note } = require('../models');

  app.get('/notes', async (req, res) => res.json(await Note.findAll()));

  app.get('/notes/:id', async (req, res) => {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    res.json(note);
  });

  app.post('/notes', async (req, res) => {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  });

  app.put('/notes/:id', async (req, res) => {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    await note.update(req.body);
    res.json(note);
  });

  app.delete('/notes/:id', async (req, res) => {
    const note = await Note.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    await note.destroy();
    res.json({ message: 'Deleted' });
  });
};
