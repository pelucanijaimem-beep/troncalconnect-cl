/* TroncalTrack — trabajador de avisos al teléfono.
   Solo muestra avisos y abre la carga al tocarlos: no guarda páginas ni datos. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch (e) {
    datos = { cuerpo: event.data ? event.data.text() : "" };
  }
  const titulo = datos.titulo || "TroncalTrack";
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || "Hay una nueva carga disponible.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: datos.tag || undefined,
      renotify: Boolean(datos.tag),
      silent: false,
      vibrate: [250, 120, 250],
      data: { url: datos.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const ruta = (event.notification.data && event.notification.data.url) || "/";
  // Solo rutas internas de TroncalTrack.
  const destino = new URL(ruta.charAt(0) === "/" && ruta.charAt(1) !== "/" ? ruta : "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.indexOf(self.location.origin) === 0 && "focus" in v) {
          return v.focus().then((c) => (c && "navigate" in c ? c.navigate(destino) : self.clients.openWindow(destino)));
        }
      }
      return self.clients.openWindow(destino);
    }),
  );
});
