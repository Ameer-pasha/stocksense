require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 ||
      process.env.JWT_SECRET.includes('replace_with_')) {
    throw new Error('Set JWT_SECRET to a random value of at least 32 characters');
  }
  let memoryServer;
  if (process.env.USE_MEMORY_DB === 'true' && process.env.NODE_ENV !== 'production') {
    const { MongoMemoryReplSet } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    process.env.MONGODB_URI = memoryServer.getUri();
    console.log('Using an ephemeral in-memory MongoDB replica set (demo only)');
  }
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  const port = Number(process.env.PORT || 5000);
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(port, host, () => {
    console.log(`StockSense API listening on ${host}:${port}`);
  });
  async function shutdown() {
    server.close();
    await mongoose.disconnect();
    if (memoryServer) await memoryServer.stop();
  }
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

if (require.main === module) {
  start().catch(error => { console.error('Could not start StockSense:', error); process.exitCode = 1; });
}
module.exports = app;
module.exports.start = start;
