/* Fretwise offline cache: the app, its icon and the Google fonts are stored on first visit; afterwards it opens with no connection. */
const C='fretwise-v34';
const FONT_CSS='https://fonts.googleapis.com/css2?family=Damion&family=Big+Shoulders:opsz,wght@10..72,500..800&family=Barlow:wght@400;500;600&display=swap';
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(C);
  await c.addAll(['./','index.html','manifest.webmanifest','icon-180.png','icon-512.png']);
  try{const r=await fetch(FONT_CSS,{mode:'cors'});if(r.ok){await c.put(FONT_CSS,r.clone());const css=await r.text();
    const urls=[...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]);
    await Promise.all(urls.map(u=>fetch(u,{mode:'cors'}).then(f=>f.ok&&c.put(u,f)).catch(()=>{})));}}catch(err){}
  self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;
  e.respondWith((async()=>{const c=await caches.open(C);
    const hit=await c.match(req,{ignoreSearch:req.mode==='navigate'})||(req.mode==='navigate'?await c.match('index.html'):null);
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    return (await net)||new Response('',{status:504});})());});
