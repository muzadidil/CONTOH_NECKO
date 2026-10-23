// Official Network-First PWA Service Worker for PG Soft Lucky Neko
const CACHE_NAME = 'pgsoft-lucky-neko-v5';

const NEKO_SYMBOLS = [
  'h_neko.png', 'h_neko_blur.png', 's_wild.png', 's_wild_blur.png',
  's_scatter.png', 's_scatter_blur.png', 'h_drum.png', 'h_drum_blur.png',
  'h_lantern.png', 'h_lantern_blur.png', 'h_fan.png', 'h_fan_blur.png',
  'h_sushi.png', 'h_sushi_blur.png', 'h_amulet.png', 'h_amulet_blur.png',
  'l_a.png', 'l_a_blur.png', 'l_k.png', 'l_k_blur.png',
  'l_q.png', 'l_q_blur.png', 'l_j.png', 'l_j_blur.png',
  'l_10.png', 'l_10_blur.png', 'gold_frame.png', 'silver_frame.png'
].map(name => './assets/sprites/' + name);

const SPRITES = [
  'auto_spin.png', 'autospin_arrow_white.png', 'autospin_circle_white.png',
  'bet_options.png', 'button_minus.png', 'button_plus.png',
  'pwa_icon_192.png', 'pwa_icon_512.png', 'shield_pg.png',
  'spin_arrow.png', 'spin_arrow_blur.png', 'spin_arrow_grey.png', 'spin_base.png',
  'turbo_off.png', 'turbo_on.png', 'win_icon.png'
].map(name => './assets/sprites/' + name);

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css?v=2.0',
  './js/audio.js',
  './js/tiles.js',
  './js/game.js',
  './js/pin.js',
  './assets/pg_native/images/c3b4d774e6.d7383.jpg',
  './assets/pg_native/images/8b9d732384.46f8f.jpg',
  './assets/audio/bgm_main.mp3',
  './assets/audio/bgm_free.mp3',
  './assets/audio/general_audio.mp3',
  './assets/audio/ui_audio.mp3',
  ...NEKO_SYMBOLS,
  ...SPRITES
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Network-first strategy so code & CSS updates always take effect immediately
  event.respondWith(
    fetch(event.request)
      .then(networkResp => {
        if (networkResp && networkResp.status === 200 && networkResp.type === 'basic') {
          const respToCache = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, respToCache);
          });
        }
        return networkResp;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResp => {
          if (cachedResp) return cachedResp;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
