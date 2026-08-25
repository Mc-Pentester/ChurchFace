self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = {};
  }

  const options = {
    body: data.body || data.message || 'Nouvelle notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      type: data.type || 'default'
    },
    actions: [
      {
        action: 'open',
        title: 'Voir',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ChurchFace', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
