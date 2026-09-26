const crypto = require('node:crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  token_version: { type: Number, default: 0, select: false },
  otp_hash: { type: String, select: false },
  otp_expiry: { type: Date, select: false },
  otp_attempts: { type: Number, default: 0, select: false },
  reset_token_hash: { type: String, select: false }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateOTP = function () {
  const otp = crypto.randomInt(100000, 1000000).toString();
  this.otp_hash = crypto.createHash('sha256').update(otp).digest('hex');
  this.otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
  this.otp_attempts = 0;
  this.reset_token_hash = undefined;
  return otp;
};

userSchema.methods.verifyOTP = function (candidate) {
  if (!/^\d{6}$/.test(candidate) || !this.otp_hash || !this.otp_expiry ||
      this.otp_expiry <= new Date() || this.otp_attempts >= 5) return false;
  const hash = crypto.createHash('sha256').update(candidate).digest();
  return crypto.timingSafeEqual(hash, Buffer.from(this.otp_hash, 'hex'));
};

module.exports = mongoose.model('User', userSchema);
