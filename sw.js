const CACHE_NAME = 'inaturalist-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/auth.js',
    '/identify.js',
    '/config.js',
    '/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch - Network First strategy for API calls, Cache First for static assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip caching for API calls and external resources
    if (url.origin !== location.origin || 
        event.request.url.includes('api.groq.com') ||
        event.request.url.includes('supabase')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached, but also update in background
                fetch(event.request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response);
                        });
                    }
                });
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
