module.exports = (app) => {
  const { Todo } = require('../models');

  app.get('/todos', async (req, res) => {
    try {
      const todos = await Todo.findAll();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.get('/todos/:id', async (req, res) => {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) return res.status(404).json({ message: 'Not found' });
      res.json(todo);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.post('/todos', async (req, res) => {
    try {
      const todo = await Todo.create(req.body);
      res.status(201).json(todo);
    } catch (error) {
      res.status(400).json({ message: 'Bad request', error: error.message });
    }
  });

  app.put('/todos/:id', async (req, res) => {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) return res.status(404).json({ message: 'Not found' });
      await todo.update(req.body);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: 'Bad request', error: error.message });
    }
  });

  app.delete('/todos/:id', async (req, res) => {
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) return res.status(404).json({ message: 'Not found' });
      await todo.destroy();
      res.json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};
