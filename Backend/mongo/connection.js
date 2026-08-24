const mongoose = require('mongoose');

let lastConnectError = null;

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    lastConnectError = err.message;
    console.error('MongoDB connection error:', err);
  }
}

function getMongoDiagnostics() {
  return {
    readyState: mongoose.connection.readyState,
    error: process.env.MONGO_URI ? lastConnectError : 'MONGO_URI environment variable is not set',
  };
}

module.exports = connectMongo;
module.exports.getMongoDiagnostics = getMongoDiagnostics;
