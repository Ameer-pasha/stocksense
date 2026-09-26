require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════╗');
    console.log('  ║         StockSense Inventory System          ║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log('');
    console.log(`  → Frontend UI:  http://localhost:${PORT}/`);
    console.log(`  → Backend API:  http://localhost:${PORT}/api`);
    console.log(`  → Health Check: http://localhost:${PORT}/api/health`);
    console.log('');
  });
}

// Only auto-start when executed directly (`node server.js` / `npm start`).
// Tests import the app without starting a server.
if (require.main === module) {
  start();
}

module.exports = { start, app };
