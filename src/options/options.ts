
export type Options = {
  sessionViewOptions: SessionViewOptions
  exchangeViewOptions: {
    showWallet: boolean;
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
  public options: Options;

  constructor (options?: Options) {
    if (options) {
      this.options = options
    } else {
      // we load options from localstorage or the default object
      this.options = localStorage.getItem('options') ? JSON.parse(localStorage.getItem('options')!) : this.default;
    }

    window.optionsManager = this;
    window.options = this.options
  }

  loadOptions (options: Options) {
    window.options = this.options = options;
  }

  get default (): Options {
    return {
      exchangeViewOptions: { showWallet: true },
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

  save () {
    localStorage.setItem('options', JSON.stringify(this.options))
  }
}

declare global {
  interface Window {
    optionsManager: OptionsManager;
    options: Options;
  }
}