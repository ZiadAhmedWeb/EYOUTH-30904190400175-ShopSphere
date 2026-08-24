const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  fs.readdirSync(uploadsDir);
} catch (err) {
  console.error('uploads dir unavailable:', err.message);
}

const app = require('../index');

module.exports = app;
