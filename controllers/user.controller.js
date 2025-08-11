const db = require("../models");
const User = db.User;
const SocialMedia = db.SocialMedia;
const Note = db.Note;
const Todo = db.Todo;
const Timetable = db.Timetable;

// Create a new user
exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all users including related data
exports.findAll = async (req, res) => {
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
};

// Get user by ID including related data
exports.findById = async (req, res) => {
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
};

// Update user by ID
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user by ID
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
