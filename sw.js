const C='nq-v8',A=['./','index.html','style.css','game.js','icon.svg','icon-192.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||!q.url.startsWith(self.location.origin))return;
e.respondWith(fetch(q).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp))}return r}).catch(()=>caches.match(q)))});
