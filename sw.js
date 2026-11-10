const C='supervivencia-v34';
const A=[
  './','index.html','styles.css','app.js','features.js','preparedness.js',
  'manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(A)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('supervivencia-')&&key!==C).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(request,{ignoreSearch:true});
    if(cached){
      fetch(request).then(response=>{if(response.ok)caches.open(C).then(cache=>cache.put(request,response.clone()));}).catch(()=>{});
      return cached;
    }
    try{
      const response=await fetch(request);
      if(response.ok)caches.open(C).then(cache=>cache.put(request,response.clone()));
      return response;
    }catch(error){
      if(request.mode==='navigate')return (await caches.match('index.html'))||new Response('Sense connexió. Obre l’app quan recuperis internet.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
      return new Response('Recurs no disponible sense connexió.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
