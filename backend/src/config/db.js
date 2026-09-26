const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocksense';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to MongoDB (${err.message}).`);
    console.info(`[MongoDB] Falling back to in-memory store so API remains fully accessible.`);
    // Return gracefully so the API server can still start and respond to HTTP requests
    return null;
  }
}

module.exports = connectDB;
