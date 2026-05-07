// River Sound and Healing — Service Worker
// Caches the site shell for offline / fast reload

const CACHE = 'river-sound-v1';
const SHELL = [
  '/',
  '/river_sound_and_healing_15.html',
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Raleway:wght@200;300;400;500&display=swap',
];

// Install — cache shell assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for shell, network-first for everything else
self.addEventListener('fetch', e => {
  // Skip non-GET and cross-origin analytics/emailjs
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('googletagmanager') ||
      e.request.url.includes('emailjs')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache successful same-origin responses
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached); // offline fallback
    })
  );
});
