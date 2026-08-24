require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const net = require('net');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const app = express();
const logRequest = require('./middleware/logger');
const connectMongo = require('./mongo/connection');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const prisma = require('./prisma/client');
connectMongo();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());
app.set('trust proxy', 1);
app.use(logRequest);

function tcpProbe(host, port, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => finish('open'));
    socket.on('timeout', () => finish(`timeout after ${timeoutMs}ms`));
    socket.on('error', (err) => finish(`error: ${err.message}`));
  });
}

function describeUri(uri) {
  if (!uri) return { present: false };
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^@/]*)@([^/:?]+)[^?]*(\?.*)?$/);
  if (!match) return { present: true, parseable: false };
  const params = new URLSearchParams(match[4] || '');
  return {
    present: true,
    parseable: true,
    scheme: match[1].includes('+srv') ? 'mongodb+srv' : 'mongodb',
    credentialsProvided: match[2].length > 0,
    host: match[3],
    database: ((match[4] || '').match(/\/([a-zA-Z0-9_-]+)\?/) || [])[1] || '(missing!)',
    directConnection: params.get('directConnection'),
    ssl: params.get('ssl') || params.get('tls'),
  };
}

async function deepMongoProbe() {
  const uri = process.env.MONGO_URI;
  const shape = describeUri(uri);
  if (!shape.present) return { uriShape: shape };

  const atlasHost = shape.parseable ? shape.host : 'ac-9pejbdf-shard-00-00.y61nxei.mongodb.net';
  const tcp = await tcpProbe(atlasHost, 27017);

  let inlineConnect;
  try {
    const probe = new mongoose.Mongoose();
    await probe.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000,
    });
    inlineConnect = 'connected';
    await probe.disconnect();
  } catch (err) {
    inlineConnect = `FAILED: ${err.message}`;
  }

  return { uriShape: shape, tcpToAtlas27017: tcp, freshInstanceConnect: inlineConnect };
}

app.get('/', (req, res) => {
  res.json({
    name: 'ZeeCrumb API',
    studentId: 'EYOUTH-30904190400175',
    project: 'ShopSphere Enterprise Production and Cloud Modernization',
    status: 'running',
    endpoints: ['/health', '/api/products', '/api/categories', '/api/auth/register'],
  });
});

app.get('/health', async (req, res) => {
  let postgres = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    postgres = 'up';
  } catch (err) {
    console.error('Health check failed for PostgreSQL:', err.message);
  }
  const mongo = mongoose.connection.readyState === 1 ? 'up' : 'down';
  const health = { status: 'ok', postgres, mongo, timestamp: new Date().toISOString() };
  if (mongo === 'down') {
    health.mongoDiagnostics = await deepMongoProbe();
  }
  res.json(health);
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
