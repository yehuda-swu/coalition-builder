/* Offline cache for 61: Build the Coalition, updated 25 November 2026. */
const CACHE = '61_coalition_unity_20261125_v1';
const VERSION = '20261125unity1';
const ASSETS = [
  './', 'index.html', 'manifest.json',
  `styles.css?v=${VERSION}`,
  `coalition_nov_2026.css?v=${VERSION}`,
  `app.js?v=${VERSION}`,
  `coalition_nov_2026.js?v=${VERSION}`,
  `data/game_data.js?v=${VERSION}`,
  `data/election_updates.js?v=${VERSION}`,
  'assets/branding/swu_uk_horizontal.webp',
  'assets/branding/swu_uk_square.webp',
  'assets/branding/welcome.webp',
  ...[
    'amcha_yisrael','byachad','democrats','haredi_public','hatzionut_hadati',
    'joint_arab_list','likud','otzma_yehudit','raam','reservists_economic',
    'shas','utj','yashar','yisrael_beitenu'
  ].map(x=>`assets/ballots/${x}.png`),
  ...[
    'abbas.webp','asher_goldknopf.png','ben_gvir.webp','bennett.webp',
    'deri.webp','eisenkot.webp','gafni_goldknopf.webp','golan.webp',
    'hendel_zelikha.png','jabareen.webp','lieberman.webp',
    'moti_leitner.png','netanyahu.webp','ofer_winter.png','smotrich.webp'
  ].map(x=>`assets/leaders/${x}`),
  ...[
    'amcha_yisrael.png','byachad.webp','democrats.webp','haredi_public.png',
    'hatzionut_hadati.webp','joint_arab_list.webp','likud.webp',
    'otzma_yehudit.webp','raam.webp','reservists_economic.png','shas.webp',
    'utj.webp','yashar.png','yisrael_beitenu.webp'
  ].map(x=>`assets/logos/${x}`)
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
  ]));
});
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
