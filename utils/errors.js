const mongoose = require('mongoose');

class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message,
      ...(err.details ? { details: err.details } : {}) });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with these unique fields already exists' });
  }
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError ||
      (err instanceof SyntaxError && err.status === 400)) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (/Transaction numbers are only allowed on a replica set|does not support retryable writes/i.test(err.message)) {
    return res.status(503).json({ success: false,
      message: 'MongoDB transactions require a replica set. See README.md for local setup.' });
  }
  console.error('API error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = { AppError, asyncRoute, errorHandler };
