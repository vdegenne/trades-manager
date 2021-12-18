import ms from "ms";
import { PairsManager, PairsManagerInterface } from "../PairsManager";
// import binancePairs from './binance-pairs.json'

declare global {
  interface Window {
    BinancePairs: { s: string, q: string }[]
  }
}

export class BinanceManager extends PairsManager implements PairsManagerInterface {
  protected timeoutMs = ms('5s')

  isPairAvailable (symbol: string, quote: string) {
    return window.BinancePairs.some(p => {
      return p.s === symbol && p.q === quote;
    })
  }

  async updateFunction () {
    if (this.pairs.length === 0) {
      return;
    }

    const result = await (await fetch('https://www.binance.com/api/v3/ticker/price')).json()

    for (const pair of this.pairs) {
      pair.price = parseFloat(result.find(r => r.symbol === `${pair.symbol}${pair.quote}`).price)
    }

    super.updateFunction()
  }

  getAvailableSymbols () {
    return [...new Set(window.BinancePairs.map(p => p.s))]
  }

  getAvailableQuotesFromSymbol (symbol: string) {
    return [...new Set(window.BinancePairs.filter(p => p.s === symbol).map(p => p.q))]
  }

  public async fetchChanges (pair?: string) {
    const response = await fetch(`https://www.binance.com/api/v3/ticker/24hr${pair ? `symbol=${pair}` : ''}`)
    return await response.json()
  }
}