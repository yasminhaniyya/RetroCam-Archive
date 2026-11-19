/**
 * RetroCam Archive - Service Worker
 * Provides offline-first caching for static assets & stale-while-revalidate for API
 */

const CACHE_NAME = 'retrocam-v3.4.0';

// Assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/fallbackData.js',
  '/js/api.js',
  '/js/storage.js',
  '/js/views/camerasView.js',
  '/js/views/cameraDetailView.js',
  '/js/views/lensesView.js',
  '/js/views/lensDetailView.js',
  '/js/views/favoritesView.js',
  '/js/views/guideView.js',
  '/js/views/profileView.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/favicon.ico'
];

// Install event: pre-cache application shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing RetroCam SW...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shell assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-cache warning (some assets might fail if offline):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: clean up outdated caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating RetroCam SW...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: handle offline and network requests
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || !requestUrl.protocol.startsWith('http')) {
    return;
  }

  // 1. Handling API requests: Network-First with Cache Fallback
  if (requestUrl.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // If valid response, clone and update cache
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[Service Worker] Network failed, serving cached API data for:', requestUrl.pathname);
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback JSON if neither network nor cache has it
          return new Response(
            JSON.stringify({
              status: 'offline',
              offline: true,
              message: 'Anda sedang offline dan data ini belum tersimpan di cache.',
              data: []
            }),
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 2. Handling JS, CSS, and HTML: Network-First with Cache Fallback
  // Ensures code updates are immediately visible on refresh
  if (
    event.request.mode === 'navigate' ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.html') ||
    requestUrl.pathname === '/'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        })
    );
    return;
  }

  // 3. Handling Static Media & Images: Cache-First with Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
