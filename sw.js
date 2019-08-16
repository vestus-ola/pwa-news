// Static files to cache
const staticFiles = [
  '/',
  '/app.js',
  'https://fonts.googleapis.com/css?family=Roboto&display=swap',
  'https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css',
  'https://code.jquery.com/jquery-3.4.1.min.js',
  'https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js',
  '/assets/css/style.min.css',
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-192x192.png',
  '/images/offline.png',
  '/fallback.json'
];

// const CACHE_NAME = "pwa-cache::v1";

const staticCache = "static-cache";
const dynamicCache = 'dynamic-cache';

self.addEventListener('install', async event => {
  const cache = await caches.open(staticCache);
  if (cache.addAll(staticFiles)) {
    console.log("[PWA Builder] Install Event processing");
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(dynamicCache);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // console.log(error);
    const cachedResponse = await cache.match(request);
    return cachedResponse || await caches.match('./fallback.json');
  }
}