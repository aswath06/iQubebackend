const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {
  User,
  SocialMedia,
  Note,
  Todo,
  Timetable,
} = require('../models');

const socialController = require('../controllers/socialMedia.controller');

// In-memory OTP store (for demo, use DB or Redis in production)
const otpStore = new Map();

// Nodemailer transporter setup — update with your SMTP credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: 'iqube4@gmail.com',
    pass: 'jwko dmug zerl derc',  // Your password or app-specific password
  },
});

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

// 🔄 Update social media by userId
router.put('/:id/socialmedia', socialController.updateByUserId);

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

// =======================
// OTP Verify Routes Start
// =======================

// Send OTP to user's email
router.post('/verify/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to send OTP' });
    }

    // Check if user exists in DB
    const user = await User.findOne({ where: { email } });

    if (user) {
      // Respond with error if email not found
      return res.status(404).json({ error: 'Email does not exist' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with 5 minute expiry
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Email options
    const mailOptions = {
      from: '"Your App Name" <your_email@example.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Sent OTP ${otp} to email ${email}`);

    res.json({ message: 'OTP sent successfully to your email.' });
  } catch (err) {
    console.error('Error sending OTP email:', err);
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
});


// Validate OTP
router.post('/verify/validate-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    if (record.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpStore.delete(email);

    res.json({ message: 'OTP verified successfully.' });
  } catch (err) {
    console.error('Error validating OTP:', err);
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});
// Get PID for a user by ID
router.get('/:id/pid', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['pid'], // only select pid
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ pid: user.pid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update PID for a user by ID (reset PID)
router.post('/:id/resetpid', async (req, res) => {
  try {
    const { pin, pid } = req.body; // pin submitted and new pid value (usually 0)
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Optional: validate 'pin' here against stored pin or any other auth logic
    // For demo, let's assume pin must match user.pin (if you have it stored)
    // if (user.pin !== pin) {
    //   return res.status(403).json({ message: 'Invalid PIN' });
    // }

    user.pid = pid; // update pid to 0 or new value
    await user.save();

    res.json({ message: 'PID updated successfully', pid: user.pid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// OTP Verify Routes End
// =======================

// Export as middleware
module.exports = app => {
  app.use('/users', router);
};
