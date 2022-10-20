/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="WebWorker" />
const sw = /** @type {ServiceWorkerGlobalScope & typeof globalThis} */ (globalThis)

sw.addEventListener('install', (e) => {
  sw.skipWaiting();

  e.waitUntil(
    caches.open('v1').then(function (cache) {
      return cache.addAll([
        './',
        './index.html',
        './app.js'
      ])
    })
  )
})

sw.addEventListener('push', (event) => {
  console.log('yo')
  sw.registration.showNotification('test', {
    silent: false
  })
})

sw.addEventListener('notificationclick', (e) => {
  const n = e.notification;
  n.close()
  // if (n.data.session.exchange === 'binance') {
  //   clients.openWindow(`https://cryptowat.ch/charts/BINANCE:${n.data.session.symbol}-${n.data.session.quote}`)
  // }
  // console.log(e.notification)
  // if (clients.openWindow && e.notification.data.url) {
  e.waitUntil(clients.matchAll({includeUncontrolled: true, type: 'window' }).then(clientsList => {
    clientsList[0].focus()
    // console.log(clientsList)
    // for (const client of clientsList) {
    //   if (client.url.startsWith('http://localhost:3000') && 'focus' in client) {
    //     return client.focus()
    //   }
    // }
  }))
})


sw.addEventListener('fetch', function(event) {
  console.log(event.request)
  event.respondWith(
            caches.match(event.request).then(response=>{
              return response || fetch(event.request)
            })
  );
});
