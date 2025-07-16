
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("sistema-unificado").then(function (cache) {
      return cache.addAll([
        "./SOBRA_SHOPEE.html",
        "./",
        "./index.html",
        "./SISTEMA_PRECIFICACAO.html",
        "./COMPARADOR_LUCRO.html",
        "./comparador.js?v=1" ,
        "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
        "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js",
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
