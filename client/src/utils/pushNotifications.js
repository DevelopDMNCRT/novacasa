// Web Push Notifications Utility for Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Main utility to register Service Worker, request browser permissions, and subscribe user to Push system.
 */
export async function subscribeToPushNotifications() {
  // 1. Verify support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported on this browser.');
    return false;
  }

  try {
    // 2. Check token existence
    const token = localStorage.getItem('token');
    if (!token) return false;

    // 3. Request Permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push permission denied by user.');
      return false;
    }

    // 4. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    console.log('[PushUtility] ServiceWorker active:', registration.active !== null);

    // 5. Retrieve VAPID Public Key from Server
    const keyResponse = await fetch(`${API_BASE_URL}/api/push/key`);
    if (!keyResponse.ok) throw new Error('Could not retrieve VAPID key from backend.');
    const { publicKey } = await keyResponse.json();

    const convertedVapidKey = urlBase64ToUint8Array(publicKey);

    // 6. Check if already subscribed to avoid duplication
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create new subscription if not existing
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log('[PushUtility] New push subscription generated.');
    }

    // 7. Parse format explicitly to send JSON correctly to backend
    const rawSubscription = JSON.parse(JSON.stringify(subscription));
    
    // Ensure structured layout matches expected Node backend params
    const subscriptionData = {
      endpoint: rawSubscription.endpoint,
      keys: {
        auth: rawSubscription.keys.auth,
        p256dh: rawSubscription.keys.p256dh
      }
    };

    // 8. Send back to server to save
    const saveResponse = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subscription: subscriptionData })
    });

    if (saveResponse.ok) {
      console.log('[PushUtility] Subscription synced with database.');
      return true;
    } else {
      console.error('[PushUtility] Failed to sync subscription with DB.');
      return false;
    }

  } catch (err) {
    console.error('[PushUtility Error]:', err);
    return false;
  }
}
