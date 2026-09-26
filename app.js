const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler } = require('./utils/errors');

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    // curl / same-origin are allowed. Preview URLs are supported in development only.
    const preview = process.env.NODE_ENV !== 'production' &&
      /^https:\/\/\d+-[a-z\d-]+\.e2b\.app$/.test(origin || '');
    callback(null, !origin || allowedOrigins.includes(origin) || preview);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected, message: 'StockSense API is running',
    data: { timestamp: new Date().toISOString(), uptime: process.uptime(),
      database: connected ? 'Connected' : 'Disconnected' }
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/stock-adjustments', require('./routes/stockAdjustments'));
app.use('/api/stock-ledger', require('./routes/stockLedger'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/search', require('./routes/search'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
