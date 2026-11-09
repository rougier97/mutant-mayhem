// MUTANT MAYHEM service worker — makes the game installable and fully playable offline.
// The whole game (code, art, audio, font) is one self-contained index.html, so caching a
// handful of files is enough. Strategy: serve from cache instantly, refresh in the background.
const CACHE = 'mutant-mayhem-v1.3.0';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png',
  './audio/menu.mp3', './audio/explore.mp3', './audio/action.mp3', './audio/boss.mp3', './audio/sfx/back.mp3', './audio/sfx/beep.mp3', './audio/sfx/boom.mp3', './audio/sfx/buy.mp3', './audio/sfx/chest.mp3', './audio/sfx/click.mp3', './audio/sfx/code_bad.mp3', './audio/sfx/code_ok.mp3', './audio/sfx/coin.mp3', './audio/sfx/crate_open.mp3', './audio/sfx/crate_tick.mp3', './audio/sfx/defeat.mp3', './audio/sfx/deflect.mp3', './audio/sfx/deny.mp3', './audio/sfx/dogbark.mp3', './audio/sfx/door.mp3', './audio/sfx/explode.mp3', './audio/sfx/gem.mp3', './audio/sfx/growl1.mp3', './audio/sfx/growl2.mp3', './audio/sfx/growl3.mp3', './audio/sfx/growl4.mp3', './audio/sfx/gun_laser.mp3', './audio/sfx/gun_pistol.mp3', './audio/sfx/gun_rifle.mp3', './audio/sfx/gun_rocket.mp3', './audio/sfx/gun_shotgun.mp3', './audio/sfx/gun_sniper.mp3', './audio/sfx/gun_zap.mp3', './audio/sfx/hit.mp3', './audio/sfx/hurt.mp3', './audio/sfx/lava_land.mp3', './audio/sfx/lava_spit.mp3', './audio/sfx/levelup.mp3', './audio/sfx/pop.mp3', './audio/sfx/powerup.mp3', './audio/sfx/raygun.mp3', './audio/sfx/reload.mp3', './audio/sfx/reload_done.mp3', './audio/sfx/roar.mp3', './audio/sfx/scream1.mp3', './audio/sfx/scream2.mp3', './audio/sfx/siren.mp3', './audio/sfx/swing.mp3', './audio/sfx/victory.mp3'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const p = new URL(req.url).pathname;
    const isPage = req.mode === 'navigate' && (p.endsWith('/') || p.endsWith('.html') || !/\.[a-z0-9]+$/i.test(p));
    const key = isPage ? './index.html' : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok) c.put(key, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response('Offline', { status: 503 });
  }));
});
