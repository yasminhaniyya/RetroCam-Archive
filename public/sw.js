/**
 * RetroCam Archive - Service Worker
 * Provides robust offline-first caching for static assets & stale-while-revalidate for API
 */

const CACHE_NAME = 'retrocam-v3.8.5';

// Assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/images/app-logo.png',
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
  '/icons/favicon.png',
  '/icons/favicon-32.png',
  '/icons/favicon-16.png',
  '/favicon.ico'
];

// Install event: pre-cache application shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing RetroCam SW...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Pre-caching app shell assets');
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response && response.ok) {
              await cache.put(url, response.clone());
              // Juga simpan tanpa query params untuk pencarian fleksibel
              const pathOnly = new URL(url, self.location.origin).pathname;
              await cache.put(pathOnly, response);
            }
          } catch (err) {
            console.warn('[Service Worker] Pre-cache skip:', url, err.message);
          }
        })
      );
    })
  );
});

// Activate event: clean up outdated caches and claim clients immediately
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

// Helper: match request in cache with ignoreSearch and fallback to pathname
async function getCachedAsset(request, pathname) {
  // 1. Try matching exact request with query parameters ignored
  let cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;

  // 2. Try matching the pathname without query string
  if (pathname) {
    cached = await caches.match(pathname, { ignoreSearch: true });
    if (cached) return cached;
  }

  // 3. Fallback for navigation requests
  if (request.mode === 'navigate' || pathname === '/' || pathname === '/index.html') {
    return (await caches.match('/index.html', { ignoreSearch: true })) || (await caches.match('/'));
  }

  return null;
}

// Fetch event: handle offline and network requests
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests and non-http protocols
  if (event.request.method !== 'GET' || !requestUrl.protocol.startsWith('http')) {
    return;
  }

  // 1. Handling API requests: Network-First with Cache Fallback
  if (requestUrl.pathname.startsWith('/api')) {
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
          console.log('[Service Worker] Network failed, serving cached API data for:', requestUrl.pathname);
          const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback JSON if neither network nor cache has it
          return new Response(
            JSON.stringify({
              status: 'offline',
              offline: true,
              message: 'Anda sedang offline dan data ini disajikan dari fallback lokal.',
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

  // 2. Handling Static Assets (CSS, JS, Fonts, Images, Icons, HTML):
  // Stale-While-Revalidate / Cache-First with ignoreSearch
  event.respondWith(
    (async () => {
      // Coba cari di cache terlebih dahulu (mengabaikan ?v=...)
      const cached = await getCachedAsset(event.request, requestUrl.pathname);

      // Jika ada di cache dan ini adalah asset static (CSS, JS, gambar, icon),
      // kembalikan langsung dari cache agar cepat & 100% offline-ready!
      if (cached && event.request.mode !== 'navigate') {
        // Update cache di background jika sedang online
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              cache.put(requestUrl.pathname, networkResponse);
            });
          }
        }).catch(() => {});
        return cached;
      }

      // Jika mode navigasi (buka halaman HTML), coba jaringan dulu, fallback ke cache jika offline
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
            cache.put(requestUrl.pathname, responseToCache.clone());
          });
        }
        return networkResponse;
      } catch (err) {
        // Jaringan gagal (OFFLINE): kembalikan dari cache!
        if (cached) {
          return cached;
        }
        if (event.request.mode === 'navigate') {
          return (await caches.match('/index.html', { ignoreSearch: true })) || (await caches.match('/'));
        }
        return new Response('', { status: 408, statusText: 'Offline' });
      }
    })()
  );
});
