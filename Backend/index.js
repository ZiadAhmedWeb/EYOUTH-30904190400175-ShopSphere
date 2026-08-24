require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const app = express();
const logRequest = require('./middleware/logger');
const ensureMongo = require('./mongo/connection');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const prisma = require('./prisma/client');

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
app.use((req, res, next) => {
  ensureMongo()
    .then(() => next())
    .catch(() => next());
});

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
  let mongo = 'down';
  try {
    await Promise.race([
      ensureMongo(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('mongo connect timeout')), 10000)),
    ]);
    mongo = 'up';
  } catch (err) {
    console.error('Health check failed for MongoDB:', err.message);
  }
  res.json({ status: 'ok', postgres, mongo, region: process.env.SIM_REGION || 'production-cloud', timestamp: new Date().toISOString() });
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
