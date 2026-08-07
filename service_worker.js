const CACHE='coalition_builder_v1';
const ASSETS=['./','index.html','styles.css','app.js','manifest.json',
'assets/logos/likud.webp','assets/logos/yashar.png','assets/logos/byachad.webp','assets/logos/democrats.webp','assets/logos/yisrael_beitenu.webp','assets/logos/hatzionut_hadati.webp','assets/logos/otzma_yehudit.webp','assets/logos/utj.webp','assets/logos/shas.webp','assets/logos/joint_arab_list.webp','assets/logos/raam.webp','assets/leaders/bibi.jpg','assets/leaders/ben_gvir.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
