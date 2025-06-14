module.exports = (app) => {
  const { SocialMedia } = require('../models');

  app.get('/socialmedia', async (req, res) => res.json(await SocialMedia.findAll()));

  app.get('/socialmedia/:id', async (req, res) => {
    const sm = await SocialMedia.findByPk(req.params.id);
    if (!sm) return res.status(404).json({ message: 'Not found' });
    res.json(sm);
  });

  app.post('/socialmedia', async (req, res) => {
    const sm = await SocialMedia.create(req.body);
    res.status(201).json(sm);
  });

  app.put('/socialmedia/:id', async (req, res) => {
    const sm = await SocialMedia.findByPk(req.params.id);
    if (!sm) return res.status(404).json({ message: 'Not found' });
    await sm.update(req.body);
    res.json(sm);
  });

  app.delete('/socialmedia/:id', async (req, res) => {
    const sm = await SocialMedia.findByPk(req.params.id);
    if (!sm) return res.status(404).json({ message: 'Not found' });
    await sm.destroy();
    res.json({ message: 'Deleted' });
  });
};
