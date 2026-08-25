const mongoose = require('mongoose');

let connectPromise = null;

function ensureMongo() {
  if (!connectPromise) {
    connectPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      })
      .then(() => {
        console.log('Reviews service: MongoDB connected');
      })
      .catch((err) => {
        console.error('Reviews service: MongoDB connection error:', err.message);
        connectPromise = null;
        throw err;
      });
  }
  return connectPromise;
}

module.exports = ensureMongo;
