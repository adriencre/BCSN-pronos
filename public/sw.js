// Service Worker pour les Web Push Notifications - BCSN Pronos

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Réception d'une notification push
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {
    title: "BCSN Pronos",
    body: "Vous avez une nouvelle notification !",
    icon: "/logo-192.png",
    badge: "/logo-192.png",
    url: "/matchs",
    tag: "bcsn-notification",
  };

  try {
    const data = event.data.json();
    payload = { ...payload, ...data };
  } catch (err) {
    payload.body = event.data.text() || payload.body;
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/logo-192.png",
    badge: payload.badge || "/logo-192.png",
    vibrate: [100, 50, 100, 50, 150],
    data: {
      url: payload.url || "/matchs",
      dateOfArrival: Date.now(),
    },
    tag: payload.tag || "bcsn-alert",
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Clic sur la notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/matchs";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si un onglet de l'app est déjà ouvert, on le focus et on navigue
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            client.focus();
            if ("navigate" in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        // Sinon, on ouvre une nouvelle fenêtre/onglet
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
