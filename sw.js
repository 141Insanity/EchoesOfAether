const CACHE="echoes-aether-v080";
const ASSETS=["./index.html","./styles.css","./icon.svg","./manifest.webmanifest","./js/main.js","./js/data.js","./js/state.js","./js/combat.js","./js/ui.js","./assets/home-town-background.png","./assets/whisperwood-background.png","./assets/trial-tower-background.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match("./index.html"))))});
