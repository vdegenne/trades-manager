self.addEventListener('install', () => {
  self.skipWaiting();
})

self.addEventListener('push', (event) => {
  console.log('yo')
  self.registration.showNotification('test', {
    silent: false
  })
})

self.addEventListener('notificationclick', (e) => {
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
  // }
  // console.log(n.data.session)
  // e.notification.close()
  // if (e.stopImmediatePropagation.)
  // console.log(clients[0])
  // clients[0].focus()
})