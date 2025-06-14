const express = require('express');
const router = express.Router();
const { User, SocialMedia, Note, Todo, Timetable } = require('../models');

// ➕ Create user
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔁 Get all users with associations
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: SocialMedia, as: 'socialMedia' },
        { model: Note, as: 'notes' },
        { model: Todo, as: 'todos' },
        { model: Timetable, as: 'timetables' },
      ],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📄 Get single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { model: SocialMedia, as: 'socialMedia' },
        { model: Note, as: 'notes' },
        { model: Todo, as: 'todos' },
        { model: Timetable, as: 'timetables' },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Full nested creation (User + All Related Tables)
router.post('/full', async (req, res) => {
  const transaction = await User.sequelize.transaction();
  try {
    const { socialMedia, notes, todos, timetables, ...userData } = req.body;

    // Create main user
    const user = await User.create(userData, { transaction });

    // Create related data if present
    if (socialMedia) {
      await SocialMedia.create({ ...socialMedia, userId: user.id }, { transaction });
    }

    if (Array.isArray(notes) && notes.length > 0) {
      await Note.bulkCreate(notes.map(n => ({ ...n, userId: user.id })), { transaction });
    }

    if (Array.isArray(todos) && todos.length > 0) {
      await Todo.bulkCreate(todos.map(td => ({ ...td, userId: user.id })), { transaction });
    }

    if (Array.isArray(timetables) && timetables.length > 0) {
      await Timetable.bulkCreate(timetables.map(tt => ({ ...tt, userId: user.id })), { transaction });
    }

    await transaction.commit();

    console.log('✅ User and nested data created, ID:', user.id);
    return res.status(201).json({
      id: user.id,
      message: 'User and related data created successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creating user with nested data:', error.message);
    return res.status(500).json({
      error: 'Something went wrong during user creation.',
      details: error.message,
    });
  }
});

// ✏️ Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export as middleware
module.exports = app => {
  app.use('/users', router);
};
