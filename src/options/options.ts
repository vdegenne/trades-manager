
export type Options = {
  sessionViewOptions: SessionViewOptions
}

export type SessionViewOptions = {
  events: boolean;
  showPrice: boolean;
  showPercent: boolean;
  showCross: boolean;
}

export class OptionsManager {
  private options: Options;

  constructor (options?: Options) {
    /* default */
    this.options = options || this.default;

    if (!options) {
      // @todo implement the localstorage loader
    }

    window.optionsManager = this;
    window.options = this.options
  }

  loadOptions (options: Options) {
    window.options = this.options = options;
  }

  get default (): Options {
    return {
      sessionViewOptions: {
        events: true,
        showPrice: true,
        showPercent: true,
        showCross: true,
      }
    }
  }

  save () {
    // @todo
  }
}

declare global {
  interface Window {
    optionsManager: OptionsManager;
    options: Options;
  }
}