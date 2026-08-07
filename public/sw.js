const CACHE_NAME = "nilam360-pwa-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512-maskable.png"
];

// Install Event: Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static app shell");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[Service Worker] Static pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Deleting legacy cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Smart Cache Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests, Vite HMR, or chrome-extension URLs
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/@vite") ||
    url.pathname.startsWith("/@id") ||
    url.protocol.startsWith("chrome-extension")
  ) {
    return;
  }

  // Network-First for API routes (/api/*)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "ஆஃப்லைன் பயன்முறை: இணைய இணைப்பு இல்லை. தயவுசெய்து இணைய இணைப்பைச் சோதிக்கவும்.",
            offline: true
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );
    return;
  }

  // Cache-First / Stale-While-Revalidate for Static Assets (JS, CSS, Images, Fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html") || caches.match("/");
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle update message from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
