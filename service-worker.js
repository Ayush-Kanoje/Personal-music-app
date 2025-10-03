const CACHE_NAME = 'vibestream-v2'; // Incremented version to ensure the new service worker is installed
const urlsToCache = [
  '/',
  '/index.html',
  // Critical assets for the app's appearance and functionality
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all essential files to the cache
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

// Activate event to clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache is not in the whitelist, delete it
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of uncontrolled clients
  );
});

// Fetch event to serve content using a "Network falling back to cache" strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests for http/https
  if (!(event.request.method === 'GET' && event.request.url.startsWith('http'))) {
    return;
  }

  event.respondWith(
    // 1. Try to fetch the resource from the network
    fetch(event.request)
      .then(networkResponse => {
        // If the fetch is successful, cache the response for offline use
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // 2. If the network request fails (e.g., user is offline), try to serve it from the cache
        return caches.match(event.request)
          .then(cachedResponse => {
            return cachedResponse;
          });
      })
  );
});

