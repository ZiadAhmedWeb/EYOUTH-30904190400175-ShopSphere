const sendWelcomeEmail = require('../utils/mailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { email } = parsed;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await sendWelcomeEmail(email);
    return res.status(200).json({ sent: true, email });
  } catch (err) {
    console.error('send-welcome-email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
