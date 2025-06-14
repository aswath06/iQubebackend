module.exports = (app) => {
  const { Todo } = require('../models');

  app.get('/todos', async (req, res) => res.json(await Todo.findAll()));

  app.get('/todos/:id', async (req, res) => {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Not found' });
    res.json(todo);
  });

  app.post('/todos', async (req, res) => {
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  });

  app.put('/todos/:id', async (req, res) => {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Not found' });
    await todo.update(req.body);
    res.json(todo);
  });

  app.delete('/todos/:id', async (req, res) => {
    const todo = await Todo.findByPk(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Not found' });
    await todo.destroy();
    res.json({ message: 'Deleted' });
  });
};

