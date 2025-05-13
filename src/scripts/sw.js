self.addEventListener('push', (event) => {
  console.log('Service worker: Push event received');

  let notificationData = {
    title: 'Story berhasil dibuat',
    options: {
      body: 'Anda telah membuat story baru',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
    },
  };

  try {
    if (event.data) {
      notificationData = JSON.parse(event.data.text());
    }
  } catch (error) {
    console.error('Error parsing notification data:', error);
  }

  const showNotificationPromise = self.registration.showNotification(
    notificationData.title,
    notificationData.options,
  );

  event.waitUntil(showNotificationPromise);
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received');

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    }),
  );
});
