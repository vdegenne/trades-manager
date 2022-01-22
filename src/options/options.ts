
export type Options = {
  generalOptions: {
    darkMode: boolean;
  },
  sessionViewOptions: SessionViewOptions
  exchangeViewOptions: {
    showWallet: boolean;
    showVirtual: boolean;
    showTerminatedSession: boolean;
    sortBy: '24hr'|'percent'|'invested'|'newest'
  }
}

export type SessionViewOptions = {
  events: boolean;
  showPrice: boolean;
  showSourceProfit: boolean;
  showTotalValue: boolean;
  showPercent: boolean;
  showCross: boolean;
}

export class OptionsManager {
  public options!: Options;

  constructor (options?: Options) {
    if (!options) {
      // we load options from localstorage or the default object
      options = localStorage.getItem('options') ? JSON.parse(localStorage.getItem('options')!) : OptionsManager.default;
    }

    if (options!.exchangeViewOptions.showTerminatedSession === undefined) {
      options!.exchangeViewOptions.showTerminatedSession = true;
    }
    if (options!.exchangeViewOptions.sortBy === undefined) {
      options!.exchangeViewOptions.sortBy = '24hr'
    }

    // window.options = this.options
    this.load(options!)
    window.optionsManager = this;
  }

  load (options: Options) {
    window.options = this.options = options;
  }

  save () {
    localStorage.setItem('options', JSON.stringify(this.options))
  }

  static get default (): Options {
    return {
      generalOptions: {
        darkMode: false
      },
      exchangeViewOptions: {
        showWallet: true,
        showVirtual: true,
        showTerminatedSession: true,
        sortBy: '24hr'
      },
      sessionViewOptions: {
        events: true,
        showPrice: true,
        showSourceProfit: false,
        showTotalValue: true,
        showPercent: true,
        showCross: false,
      }
    }
  }
}

declare global {
  interface Window {
    optionsManager: OptionsManager;
    options: Options;
  }
}