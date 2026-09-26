require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8 || !process.env.MONGODB_URI) {
    throw new Error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters)');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  let user = await User.findOne({ email }).select('+token_version');
  if (user) {
    user.password = password;
    user.role = 'admin';
    user.token_version += 1; // Revoke tokens issued before this bootstrap/update.
    await user.save();
  } else {
    user = await User.create({ name: process.env.ADMIN_NAME || 'Administrator',
      email, password, role: 'admin' });
  }
  console.log(`Administrator ready: ${user.email} (password not displayed)`);
}

main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
