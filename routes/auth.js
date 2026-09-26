const crypto = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { rateLimit } = require('express-rate-limit');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { AppError, asyncRoute } = require('../utils/errors');
const { requiredString, objectId } = require('../utils/validation');

const router = express.Router();
const limited = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: 'draft-7',
  legacyHeaders: false, message: { success: false, message: 'Too many attempts; try again later' } });
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });
const accessToken = (user) => jwt.sign(
  { id: user._id.toString(), type: 'access', v: user.token_version },
  process.env.JWT_SECRET, { expiresIn: '30d' }
);

router.post('/signup', limited, asyncRoute(async (req, res) => {
  const { name, email, password, role } = req.body;
  requiredString(name, 'name');
  requiredString(email, 'email');
  if (typeof password !== 'string' || password.length < 8) {
    throw new AppError(400, 'password must be at least 8 characters');
  }
  // Public registration must never grant administrative roles.
  if (role && role !== 'staff') throw new AppError(403, 'Public signup can only create staff accounts');
  const user = await User.create({ name, email: email.trim().toLowerCase(), password, role: 'staff' });
  res.status(201).json({ success: true, message: 'User registered successfully',
    data: { token: accessToken(user), user: publicUser(user) } });
}));

router.post('/login', limited, asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  requiredString(email, 'email');
  if (typeof password !== 'string' || !password) throw new AppError(400, 'password is required');
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password +token_version');
  if (!user || !(await user.comparePassword(password))) throw new AppError(401, 'Invalid credentials');
  res.json({ success: true, message: 'Login successful',
    data: { token: accessToken(user), user: publicUser(user) } });
}));

router.post('/forgot-password', limited, asyncRoute(async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase();
  const devOTP = process.env.NODE_ENV === 'development' && process.env.DEV_RETURN_OTP === 'true';
  const mailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_FROM);
  if (!devOTP && !mailEnabled) throw new AppError(503, 'Password reset email is not configured');

  const response = { success: true, message: 'If the account exists, reset instructions have been sent' };
  const user = await User.findOne({ email }).select('+otp_hash +otp_expiry +otp_attempts +reset_token_hash');
  if (!user) return res.json(response);
  const otp = user.generateOTP();
  await user.save();

  if (mailEnabled) {
    try {
      const port = Number(process.env.SMTP_PORT || 587);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port, secure: port === 465,
        ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } : {})
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM, to: user.email, subject: 'StockSense password reset code',
        text: `Your StockSense verification code is ${otp}. It expires in 10 minutes.`
      });
    } catch (error) {
      console.error('Could not send password reset email:', error);
      throw new AppError(503, 'Could not send password reset email');
    }
  }
  if (devOTP) response.data = { otp, expiry: user.otp_expiry };
  res.json(response);
}));

router.post('/verify-otp', limited, asyncRoute(async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase();
  const { otp } = req.body;
  if (typeof otp !== 'string' || !/^\d{6}$/.test(otp)) throw new AppError(400, 'otp must be a six-digit string');
  const user = await User.findOne({ email }).select('+otp_hash +otp_expiry +otp_attempts');
  if (!user || !user.verifyOTP(otp)) {
    if (user && user.otp_hash && user.otp_expiry > new Date()) {
      await User.updateOne({ _id: user._id, otp_hash: user.otp_hash }, { $inc: { otp_attempts: 1 } });
    }
    throw new AppError(400, 'Invalid or expired OTP');
  }
  const resetToken = jwt.sign({ id: user._id.toString(), type: 'password_reset' },
    process.env.JWT_SECRET, { expiresIn: '10m', jwtid: crypto.randomUUID() });
  const consumed = await User.updateOne(
    { _id: user._id, otp_hash: user.otp_hash, otp_expiry: { $gt: new Date() }, otp_attempts: { $lt: 5 } },
    { $unset: { otp_hash: '', otp_expiry: '' }, $set: { reset_token_hash: hash(resetToken) } }
  );
  if (!consumed.modifiedCount) throw new AppError(400, 'Invalid or expired OTP');
  res.json({ success: true, message: 'OTP verified successfully', data: { resetToken } });
}));

router.post('/reset-password', limited, asyncRoute(async (req, res) => {
  const email = requiredString(req.body.email, 'email').toLowerCase();
  const { newPassword, resetToken } = req.body;
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new AppError(400, 'newPassword must be at least 8 characters');
  }
  if (typeof resetToken !== 'string' || !resetToken) throw new AppError(400, 'resetToken is required');
  let payload;
  try { payload = jwt.verify(resetToken, process.env.JWT_SECRET); } catch { /* invalid/expired */ }
  if (payload?.type !== 'password_reset' || !payload.id) throw new AppError(401, 'Invalid or expired reset token');

  // Single-use token: consume it and update the password in ONE atomic update.
  const password = await require('bcryptjs').hash(newPassword, 10);
  const updated = await User.findOneAndUpdate(
    { _id: payload.id, email, reset_token_hash: hash(resetToken) },
    { $set: { password }, $unset: { reset_token_hash: '', otp_hash: '', otp_expiry: '' },
      $inc: { token_version: 1 } },
    { new: true, runValidators: true }
  );
  if (!updated) throw new AppError(401, 'Invalid or expired reset token');
  res.json({ success: true, message: 'Password reset successful. Please log in again.' });
}));

router.get('/me', protect, (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

router.get('/users', protect, authorize('admin'), asyncRoute(async (req, res) => {
  const users = await User.find().sort({ name: 1 });
  res.json({ success: true, data: users.map(publicUser) });
}));

router.put('/users/:id/role', protect, authorize('admin'), asyncRoute(async (req, res) => {
  const id = objectId(req.params.id);
  if (!['admin', 'manager', 'staff'].includes(req.body.role)) throw new AppError(400, 'Invalid role');
  if (id.equals(req.user._id) && req.body.role !== 'admin') {
    throw new AppError(400, 'Cannot remove your own admin role');
  }
  const user = await User.findByIdAndUpdate(id, { $set: { role: req.body.role },
    $inc: { token_version: 1 } }, { new: true, runValidators: true });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ success: true, message: 'Role updated; user must log in again', data: { user: publicUser(user) } });
}));

module.exports = router;
