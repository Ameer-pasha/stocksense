require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('[FATAL] Could not connect to MongoDB:', err.message);
    console.error('        -> Make sure MongoDB is running (or set MONGODB_URI in .env).');
    console.error('        -> See backend/.env.example');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`StockSense API running on http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

// Only auto-start when executed directly (`node server.js` / `npm start`).
// Tests import the app without starting a server.
if (require.main === module) {
  start();
}

module.exports = { start, app };
