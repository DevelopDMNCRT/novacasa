const express = require('express');
const router = express.Router();
const db = require('../db');
const requireAuth = require('../middleware/auth');

// GET /api/push/key
// Send public key to client to register SW
router.get('/key', (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(500).json({ error: 'VAPID Public Key not configured on server.' });
  }
  res.json({ publicKey: key });
});

// POST /api/push/subscribe
// Save browser subscription for current user
router.post('/subscribe', requireAuth, async (req, res) => {
  const { subscription } = req.body;
  const userId = req.user.id;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Invalid PushSubscription object.' });
  }

  const { endpoint, keys } = subscription;

  try {
    // Insert or update. Since endpoint MUST be unique, we use UPSERT
    const query = `
      INSERT INTO push_subscriptions (user_id, endpoint, auth, p256dh)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        auth = EXCLUDED.auth,
        p256dh = EXCLUDED.p256dh,
        created_at = NOW()
      RETURNING id
    `;

    await db.query(query, [
      userId,
      endpoint,
      keys.auth,
      keys.p256dh
    ]);

    res.status(201).json({ success: true, message: 'Subscription saved successfully.' });
  } catch (err) {
    console.error('Error saving push subscription:', err);
    res.status(500).json({ error: 'Failed to register push subscription.' });
  }
});

module.exports = router;
