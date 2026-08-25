const Log = require('../models/Log');

function severity(statusCode) {
  if (statusCode >= 500) return 'ERROR';
  if (statusCode >= 400) return 'WARN';
  return 'INFO';
}

function logRequest(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const sev = severity(res.statusCode);
    const ts = new Date().toISOString();
    const userId = req.user?.userId || '-';
    const line = `[${ts}] [${sev}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms user=${userId}`;
    if (sev === 'ERROR') {
      console.error(line);
    } else {
      console.log(line);
    }
    Log.create({
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      userId: req.user?.userId || null,
    }).catch((err) => console.error('Log save error:', err));
  });
  next();
}

module.exports = logRequest;