const webpush = require('web-push');

// Setup Web Push config using VAPID keys from environment
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:develop@dmncrt.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log('[WebPush] VAPID Details set successfully.');
} else {
  console.error('[WebPush] WARNING: VAPID keys missing in environment. Web push notifications will fail.');
}

/**
 * Sends a push notification to a specific list of subscriptions.
 * Automatically cleans up invalid subscriptions if service returns 410 (Gone) or 404.
 * @param {Array} subscriptions Database rows from push_subscriptions
 * @param {Object} payload The notification payload
 * @param {Object} dbRef Database client context to remove expired subs if necessary
 */
async function broadcastPush(subscriptions, payload, dbRef) {
  const payloadString = JSON.stringify(payload);
  let successes = 0;
  let failures = 0;

  const promises = subscriptions.map(async (sub) => {
    // Construct required shape for web-push
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        auth: sub.auth,
        p256dh: sub.p256dh
      }
    };

    try {
      await webpush.sendNotification(pushSubscription, payloadString);
      successes++;
    } catch (err) {
      failures++;
      // If code 410 (Gone) or 404, the device unregistered, subscription has expired.
      // We MUST remove it from the database to save performance.
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log(`[WebPush] Removing expired subscription: ${sub.endpoint.substring(0, 30)}...`);
        if (dbRef) {
          try {
            await dbRef.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
          } catch (dbErr) {
            console.error('[WebPush] Failed to delete expired sub from DB:', dbErr.message);
          }
        }
      } else {
        console.error('[WebPush] Push delivery failed:', err.message);
      }
    }
  });

  await Promise.all(promises);
  return { successes, failures };
}

module.exports = { webpush, broadcastPush };
