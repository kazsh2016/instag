// キャッシュファイルの指定
var CACHE_NAME = 'instag-caches';
var urlsToCache = [
    '/kazsh2016.github.io/instag/index.html',
    '/kazsh2016.github.io/instag/assets/js/index.js',
    '/kazsh2016.github.io/instag/assets/js/service_worker.js',
    '/kazsh2016.github.io/instag/assets/js/data.json',
    '/kazsh2016.github.io/instag/assets/css/reset.css',
    '/kazsh2016.github.io/instag/assets/css/style.css',
];

// インストール処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});