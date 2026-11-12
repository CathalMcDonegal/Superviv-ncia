const C='supervivencia-v42';
const A=[
 './','index.html','styles.css?v=40','app.js?v=23','features.js?v=17','preparedness.js?v=3','enhancements.js?v=41',
 'manifest.json?v=9','icon-192.png?v=9','icon-512.png','icon-maskable-512.png','apple-touch-icon.png?v=9'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(C).then(cache=>cache.addAll(A)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('supervivencia-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(C),cached=await cache.match(req,{ignoreSearch:true});
  if(cached){fetch(req).then(r=>{if(r.ok)cache.put(req,r.clone())}).catch(()=>{});return cached;}
  try{const r=await fetch(req);if(r.ok)cache.put(req,r.clone());return r;}
  catch(_){if(req.mode==='navigate')return (await cache.match('index.html'))||new Response('Sense connexió. Obre l’app quan recuperis internet.',{status:503});return new Response('Recurs no disponible sense connexió.',{status:503});}
 })());
});
