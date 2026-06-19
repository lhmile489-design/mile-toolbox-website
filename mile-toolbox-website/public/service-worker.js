/* 米乐的百宝箱 · 轻量 Service Worker（离线应用外壳 + 静态资源缓存） */
/* eslint-disable no-restricted-globals */
const CACHE = 'mile-toolbox-v1';
const CORE = ['./', './index.html', './manifest.json', './appIcon.png'];

// 后端/接口路径：不缓存，始终走网络
const API_RE = /^\/(tool|user|pdf|query|image|doc|favorite|usage)\b/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // 跨域（字体等）交给浏览器
  if (API_RE.test(url.pathname)) return; // 接口不缓存

  // 页面导航：网络优先，离线回退到缓存的 index.html（SPA 外壳）
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }

  // 静态资源：缓存优先 + 后台更新
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
