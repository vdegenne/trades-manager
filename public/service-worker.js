self.addEventListener('install', () => {
  self.skipWaiting();
})

self.addEventListener('push', (event) => {
  console.log('yo')
  self.registration.showNotification('test', {
    silent: false
  })
})