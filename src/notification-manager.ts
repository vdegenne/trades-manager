
export class NotificationManager {

  private isPushEnabled = false;

  // Persistant variable to avoid multiple notifications on the interface
  private _available?: boolean = undefined

  private _reg?: ServiceWorkerRegistration = undefined

  public async checkPermission () {
    if (this._available !== undefined)
      return this._available

    // Ask if permission is default
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission === 'default' || Notification.permission === 'denied') {
      return this.pushUnavailability()
    }

    if ('serviceWorker' in navigator) {
      if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
        return this.pushUnavailability()
      }
      try {
        this._reg = await navigator.serviceWorker.register('./service-worker.js')
      }
      catch (e) {
        return this.pushUnavailability()
      }
    }

    return this._available = true
  }

  private initialiseState() {
    // if (Notification.permission === 'denied') {
    //   console.warn('The user has blocked notifications.');
    //   return;
    // }

    // if (!('PushManager' in window)) {
    //   console.warn('Push messaging isn\'t supported.');
    //   return;
    // }

    // navigator.serviceWorker.ready.then(ServiceWorkerRegistration => {
    //   console.log(ServiceWorkerRegistration);
    //   ServiceWorkerRegistration.pushManager.getSubscription().then(subscription => {
    //     console.log(subscription);
    //   })
    //   .catch(err => console.warn('Error during getSubscription()', err))
    // })
  }

  private pushUnavailability () {
    this._available = false
    window.app.toast('Notifications unavailable or denied.')
    return false
  }

  get available () {
    return this._available
  }


  public notify (title, options = {}) {
    if (this._reg) {
      this._reg.showNotification(title, {
        silent: false,
        requireInteraction: true
      })
    }
  }
}

declare global {
  interface Window {
    notificationService: NotificationManager;
  }
}

window.notificationService = new NotificationManager;