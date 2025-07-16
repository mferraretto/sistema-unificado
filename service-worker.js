self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("sistema-unificado").then(function (cache) {
      return cache.addAll([
        "./", // raiz
        "./index.html",
        "./COMPARADOR_LUCRO.html",
        "./SISTEMA_PRECIFICACAO.html",
        "./SOBRA_SHOPEE.html",
        "./comparador.js",
        "./manifest.json",
        "./icon-512.png"
      ]);
    }).catch(err => console.error("Erro ao fazer cache:", err))
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
