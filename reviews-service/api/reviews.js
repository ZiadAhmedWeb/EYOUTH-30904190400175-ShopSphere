require('dotenv').config();
const ensureMongo = require('../lib/mongo');
const { verifyToken } = require('../lib/auth');
const Review = require('../models/Review');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureMongo();
  } catch {
    return res.status(503).json({ error: 'Database unavailable' });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const productId = pathParts[pathParts.length - 1];

  if (!productId || isNaN(Number(productId))) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  if (req.method === 'GET') {
    try {
      const reviews = await Review.find({ productId: Number(productId) }).sort({ createdAt: -1 });
      return res.status(200).json(reviews);
    } catch (err) {
      console.error('Reviews GET error:', err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  if (req.method === 'POST') {
    const user = verifyToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    let body = '';
    for await (const chunk of req) body += chunk;
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    const { rating, comment } = parsed;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
      const existing = await Review.findOne({
        productId: Number(productId),
        userId: user.userId,
      });

      if (existing) {
        return res.status(409).json({ error: 'You already reviewed this product' });
      }

      const review = await Review.create({
        productId: Number(productId),
        userId: user.userId,
        userEmail: user.email,
        rating,
        comment: comment || '',
      });

      return res.status(201).json(review);
    } catch (err) {
      console.error('Reviews POST error:', err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
