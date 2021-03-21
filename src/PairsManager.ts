import ms from "ms";

export type Pair = {
  symbol: string;
  quote: string;
  price?: number
}

export interface PairsManagerInterface {
  isPairAvailable (symbol: string, quote: string): boolean;
  updateFunction (): void;
  getAvailableSymbols (): string[];
  getAvailableQuotesFromSymbol (symbol: string): string[];
}

export class PairsManager implements PairsManagerInterface {
  protected pairs: Pair[] = []
  protected updateTimeout?: NodeJS.Timeout;
  protected timeoutMs: number = ms('20s');

  constructor(pairs?: Pair[]) {
    if (pairs) {
      this.pairs = pairs;
    }
  }

  /**
   * pairExists will check if the pair exists in the pairs list, hence
   * if it was registered.
   * Also check for `isPairAvailable` to understand the subtle difference. 
   */
  pairExists (symbol: string, quote: string) {
    return this.pairs.some(p => {
      return p.symbol === symbol && p.quote === quote
    })
  }

  /**
   * isPairAvailable will check if the pair exists in the whole exchange
   * and then if it is available for registration
   */
  isPairAvailable(symbol: string, quote: string) {
    // should be overrided
    return false
  }

  getPair (symbol: string, quote: string): Pair|undefined {
    return this.pairs.find(p => p.symbol === symbol && p.quote === quote)
  }

  async addPair (symbol: string, quote: string, updatePairs = true) {
    if (!this.isPairAvailable(symbol, quote)) {
      return false;
    }

    if (!this.pairExists(symbol, quote)) {
      this.pairs.push({
        symbol,
        quote
      })
    }

    // if (updatePairs) {
    //   await this.updatePairs()
    // }

    return true
  }

  async updatePairs () {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
      this.updateTimeout = undefined;
    }
    
    this.updateTimeout = setTimeout(() => this.updatePairs(), this.timeoutMs)
    await this.updateFunction()
  }

  /**
   * This function will fetch information from coingecko to update the data structure (price)
   * It calls itself automatically every 30s unless it's explicitly called, in which case
   * it will trigger code execution and reset the timer
   */
  async updateFunction () {
    window.app.tradesInterface.refreshUI()
  }

  getAvailableSymbols() {
    return [] as string[]
  }

  getAvailableQuotesFromSymbol(symbol: string) {
    return [] as string[]
  }

  getPrice (symbol: string, quote: string) {
    const pair = this.getPair(symbol, quote)
    if (pair) {
      return pair.price
    }
    else {
      return undefined;
    }
  }
}