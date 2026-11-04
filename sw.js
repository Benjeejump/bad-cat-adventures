const CACHE = "bad-cat-shell-v6";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./game-map.js",
  "./loot.js",
  "./assets/net.svg",
  "./game-map-style.json",
  "./assets/maplibre/maplibre-gl.js",
  "./assets/maplibre/maplibre-gl.css",
  "./assets/maplibre/leaflet-maplibre-gl.js",
  "./adventure.js",
  "./cinematics.js",
  "./word-bank.js",
  "./spelling.js",
  "./learning.css",
  "./assets/spelling-bee.svg",
  "./targeting.js",
  "./campaign.js",
  "./puppy-options.js",
  "./assets/giant-puppy.svg",
  "./assets/kitten.svg",
  "./site-config.js",
  "./map-mode.css",
  "./assets/odyssey.svg",
  "./assets/bad-cat.svg",
  "./assets/metro.svg",
  "./assets/amy.svg",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/leaflet/leaflet.js",
  "./assets/leaflet/leaflet.css",
  "./assets/leaflet/images/layers.png",
  "./assets/leaflet/images/layers-2x.png",
  "./assets/leaflet/images/marker-icon.png",
  "./assets/leaflet/images/marker-icon-2x.png",
  "./assets/leaflet/images/marker-shadow.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("bad-cat-shell-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Never intercept GPS, third-party requests or OpenStreetMap tiles. No bulk tile caching.
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  const localShell = SHELL.map(
    (path) => new URL(path, self.registration.scope).href,
  );
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html")),
    );
  } else if (localShell.includes(url.href)) {
    event.respondWith(
      caches
        .match(event.request)
        .then((cached) => cached || fetch(event.request)),
    );
  }
});
