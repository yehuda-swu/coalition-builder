const CACHE='61_poll_2026_08_24';
const ASSETS=[
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'data/game_data.js',
  'data/election_updates.js'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(
      keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
    ))
  ]));
});

self.addEventListener('fetch',event=>{
  event.respondWith(
    fetch(event.request).catch(()=>caches.match(event.request))
  );
});
