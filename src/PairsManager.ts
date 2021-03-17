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

  pairExists (symbol: string, quote: string) {
    return this.pairs.some(p => {
      return p.symbol === symbol && p.quote === quote
    })
  }

  isPairAvailable(symbol: string, quote: string) {
    // should be overrided
    return false
  }

  getPair (symbol: string, quote: string): Pair|undefined {
    return this.pairs.find(p => p.symbol === symbol && p.quote === quote)
  }

  addPair (symbol: string, quote: string, updatePairs = true) {
    if (!this.isPairAvailable(symbol, quote)) {
      return false;
    }

    if (!this.pairExists(symbol, quote)) {
      this.pairs.push({
        symbol,
        quote
      })

      if (updatePairs)
        this.updatePairs()
    }

    return true
  }

  updatePairs () {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
      this.updateTimeout = undefined;
    }
    
    this.updateTimeout = setTimeout(() => this.updatePairs(), this.timeoutMs)
    this.updateFunction()
  }

  /**
   * This function will fetch information from coingecko to update the data structure (price)
   * It calls itself automatically every 30s unless it's explicitly called, in which case
   * it will trigger code execution and reset the timer
   */
  async updateFunction () {
    // window.app.tradesInterface.requestUpdate()
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