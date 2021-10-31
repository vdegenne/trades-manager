
export class ServiceWorkerManager {

  private isPushEnabled = false;

  constructor() {
    // window.addEventListener('load', function () {
    // })

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(this.initialiseState.bind(this))
    } else {
      this.notifyAboutUnavailability()
    }
  }

  public askNotificationPermission () {
    if ('serviceWorker' in navigator) {
    } else {
      this.notifyAboutUnavailability()
    }
  }

  private serviceWorkerAvailabilityCheck = false
  private notifyAboutUnavailability () {
    if (this.serviceWorkerAvailabilityCheck) {
      return;
    }
    window.app.toast('Notifications support not available in this browser.')
    this.serviceWorkerAvailabilityCheck = true;
  }

  private initialiseState() {
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      console.warn('Notifications aren\'t supported.');
      return;
    }

    if (Notification.permission === 'denied') {
      console.warn('The user has blocked notifications.');
      return;
    }

    if (!('PushManager' in window)) {
      console.warn('Push messaging isn\'t supported.');
      return;
    }

    // navigator.serviceWorker.ready.then(ServiceWorkerRegistration => {
    //   console.log(ServiceWorkerRegistration);
    //   ServiceWorkerRegistration.pushManager.getSubscription().then(subscription => {
    //     console.log(subscription);
    //   })
    //   .catch(err => console.warn('Error during getSubscription()', err))
    // })
  }
}

declare global {
  interface Window {
    serviceWorkerManager: ServiceWorkerManager;
  }
}

window.serviceWorkerManager = new ServiceWorkerManager;