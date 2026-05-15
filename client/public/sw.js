// Service Worker for Quiniela Web Push Notifications
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Fallback if payload is plain text
      data = {
        notification: {
          title: 'Quiniela Mundialista Nova Casa',
          body: event.data.text()
        }
      };
    }
  }

  const notification = data.notification || {};
  const title = notification.title || 'Quiniela Mundialista Nova Casa';
  
  const options = {
    body: notification.body || '¡Tienes una actualización importante de tu quiniela!',
    icon: notification.icon || '/logo.png', // fallback to app logo if exists
    badge: notification.badge || '/logo.png',
    vibrate: notification.vibrate || [100, 50, 100],
    data: notification.data || { url: '/' } // pass URLs securely to interaction
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle user clicking on the notification
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked.');
  event.notification.close();

  // Fetch target URL from the custom data field
  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      // If a window is already open at this site, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
