module.exports = (app) => {
  const { Timetable } = require('../models');

  app.get('/timetables', async (req, res) => res.json(await Timetable.findAll()));

  app.get('/timetables/:id', async (req, res) => {
    const entry = await Timetable.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json(entry);
  });

  app.post('/timetables', async (req, res) => {
    const entry = await Timetable.create(req.body);
    res.status(201).json(entry);
  });

  app.put('/timetables/:id', async (req, res) => {
    const entry = await Timetable.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    await entry.update(req.body);
    res.json(entry);
  });

  app.delete('/timetables/:id', async (req, res) => {
    const entry = await Timetable.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Not found' });
    await entry.destroy();
    res.json({ message: 'Deleted' });
  });
};
