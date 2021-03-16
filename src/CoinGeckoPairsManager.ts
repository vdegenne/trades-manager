import coingeckoAssets from './coingecko-assets.json'
import ms from "ms"

export type CoingeckoPair = {
  symbol: typeof coingeckoAssets[number]['s'][number];
  currency: string;
  price?: number
}

export class CoingeckoPairsManager {
  private pairs: CoingeckoPair[] = []


  addPair (symbol: string, currency: string) {
    if (!coingeckoAssets.some(a => a.s === symbol)) {
      window.app.toast('This symbol doesn\'t exist')
      return false
    }
    if (!coingeckoAssets.some(a => a.s === currency)) {
      window.app.toast('This currency doesn\'t exist')
      return false
    }

    if (!this.pairs.some(p => p.symbol === symbol && p.currency === currency)) {
      this.pairs.push({
        symbol,
        currency
      })
    }

    return true
  }

  buildCoingeckoAPIArguments () {
    return {
      ids: [...this.pairs.map(p => coingeckoAssets.find(a => a.s === p.symbol)!.id)].join(','),
      vs_currencies: [...this.pairs.map(p => coingeckoAssets.find(a => a.s === p.currency)!.id)].join(',')
    }
  }

  /**
   * This function will fetch information from coingecko to update the data structure (price)
   * It calls itself automatically every 30s unless it's explicitly called, in which case
   * it will trigger code execution and reset the timer
   */
  updateTimeout?: NodeJS.Timeout;
  updatePairs () {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
      this.updateTimeout = undefined;
    }
    
    this.updateTimeout = setTimeout(() => this.updatePairs(), ms('30s'))
    this.updateFunction()
  }

  updateFunction () {
    const {ids, vs_currencies} = this.buildCoingeckoAPIArguments()
  }
}