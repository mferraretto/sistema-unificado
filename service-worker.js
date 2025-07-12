
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("sistema-unificado").then(function (cache) {
      return cache.addAll([
        "./",
        "./index.html",
        "./SISTEMA_PRECIFICACAO.html",
        "./COMPARADOR_LUCRO.html",
        "./manifest.json",
        "./icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
