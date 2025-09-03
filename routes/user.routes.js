// routes/users.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { User, SocialMedia, Note, Todo, Timetable } = require('../models');
const socialController = require('../controllers/socialMedia.controller');

// In-memory OTP store (for demo — use DB/Redis in production)
const otpStore = new Map();

// In-memory token store for QR links: token -> { studentId, expiresAt }
const qrTokenStore = new Map();

// Optional: cleanup interval to remove expired tokens every minute
setInterval(() => {
  const now = Date.now();
  for (const [token, meta] of qrTokenStore.entries()) {
    if (meta.expiresAt <= now) qrTokenStore.delete(token);
  }
}, 60 * 1000);

// Nodemailer transporter (update credentials)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'iqube4@gmail.com',
    pass: 'jwko dmug zerl derc',
  },
});

// =============================
// User CRUD
// =============================

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
router.post('/:id/resetpid', async (req, res) => {
  try {
    const { pin, pid } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.pin = pin;
    user.pid = pid;
    await user.save();

    res.json({ message: 'PID reset successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post('/full', async (req, res) => {
  const transaction = await User.sequelize.transaction();
  try {
    const { socialMedia, notes, todos, timetables, ...userData } = req.body;
    const user = await User.create(userData, { transaction });

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
    return res.status(201).json({
      id: user.id,
      message: 'User and related data created successfully',
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
});

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

router.put('/:id/socialmedia', socialController.updateByUserId);

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

// =============================
// OTP Routes
// =============================

router.post('/verify/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ where: { email } });
    if (user) return res.status(404).json({ error: 'Email already exists' });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await transporter.sendMail({
      from: '"Your App" <your_email@example.com>',
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is <b>${otp}</b>. Expires in 5 minutes.</p>`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify/validate-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email & OTP required' });

    const record = otpStore.get(email);
    if (!record) return res.status(400).json({ error: 'OTP expired or not found' });
    if (record.expiresAt < Date.now()) return res.status(400).json({ error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    otpStore.delete(email);
    res.json({ message: 'OTP verified successfully.' });
  } catch {
    res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

// =============================
// QR Code Linking (tokenized, hides id/name)
// =============================

/**
 * GET /users/:id/student-qr
 * - Generates a short random token
 * - Stores mapping token -> studentId in-memory with expiry
 * - Returns a QR image (data URL) which encodes only the token
 */
router.get('/:id/student-qr', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a secure random token (32 hex chars)
    const token = crypto.randomBytes(16).toString('hex');

    // Store mapping with expiry (5 minutes)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    qrTokenStore.set(token, { studentId: user.id, expiresAt });

    // Generate QR encoding only the token (no name/id)
    const qrImageUrl = await QRCode.toDataURL(token);

    // Return only the QR image (no sensitive data)
    res.json({ qrCode: qrImageUrl, expiresAt });
  } catch (err) {
    console.error('Error generating student QR:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /users/link-student-token
 * Body: { token, parentId }
 * - Validates token & expiry, finds studentId from store
 * - Links parentId to student in DB by setting student.parentId
 * - Deletes token after use
 */
router.post('/link-student-token', async (req, res) => {
  try {
    const { token, parentId } = req.body;
    if (!token || !parentId) return res.status(400).json({ error: 'token and parentId required' });

    const meta = qrTokenStore.get(token);
    if (!meta) return res.status(400).json({ success: false, message: 'Invalid or used token' });
    if (meta.expiresAt < Date.now()) {
      qrTokenStore.delete(token);
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    const student = await User.findByPk(meta.studentId);
    const parent = await User.findByPk(parentId);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!parent || parent.role !== 'parent') return res.status(404).json({ error: 'Parent not found' });

    // Link and persist
    student.parentId = parent.id;
    await student.save();

    // One-time use token
    qrTokenStore.delete(token);

    res.json({ success: true, message: 'Student linked to parent successfully', student });
  } catch (err) {
    console.error('Error linking by token:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Backwards-compatible endpoint (existing)
 * POST /users/link-student
 * Body: { studentId, parentId }
 */
router.post('/link-student', async (req, res) => {
  try {
    const { studentId, parentId } = req.body;
    const student = await User.findByPk(studentId);
    const parent = await User.findByPk(parentId);

    if (!student) {
      return res.status(404).json({ error: 'User to link not found' });
    }
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({ error: 'Parent not found' });
    }

    student.parentId = parent.id;
    await student.save();

    res.json({ message: 'User linked to parent successfully', student });
  } catch (err) {
    console.error('Error linking student:', err);
    res.status(500).json({ error: err.message });
  }
});
// =============================
// Get all students for a given parentId
// =============================
router.get('/parent/:parentId/students', async (req, res) => {
  try {
    const { parentId } = req.params;

    // Find students whose parentId matches
    const students = await User.findAll({
      where: { parentId },
      include: [
        { model: SocialMedia, as: 'socialMedia' },
        { model: Note, as: 'notes' },
        { model: Todo, as: 'todos' },
        { model: Timetable, as: 'timetables' },
      ],
    });

    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found for this parentId' });
    }

    res.json(students);
  } catch (err) {
    console.error('Error fetching students by parentId:', err);
    res.status(500).json({ error: err.message });
  }
});
router.post('/:id/setpid', async (req, res) => {
  try {
    const { pid, pin } = req.body; // both optional or required as per your use case

    if (!pid) {
      return res.status(400).json({ error: 'PID is required' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update pid and optionally pin
    user.pid = pid;
    if (pin) {
      user.pin = pin;
    }

    await user.save();

    res.json({ message: 'PID set successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = app => {
  app.use('/users', router);
};
