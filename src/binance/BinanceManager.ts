import ms from "ms";
import { PairsManager, PairsManagerInterface } from "../PairsManager";
import binancePairs from './binance-pairs.json'

export class BinanceManager extends PairsManager implements PairsManagerInterface {
  protected timeoutMs = ms('5s')

  isPairAvailable (symbol: string, quote: string) {
    symbol = symbol.toUpperCase()
    quote = quote.toUpperCase()
    return binancePairs.some(p => {
      return p.s === symbol && p.q === quote;
    })
  }

  async addPair (symbol: string, quote: string, updatePairs = true) {
    return super.addPair(symbol.toUpperCase(), quote.toUpperCase(), updatePairs)
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
    return [...new Set(binancePairs.map(p => p.s))]
  }

  getAvailableQuotesFromSymbol (symbol: string) {
    return [...new Set(binancePairs.filter(p => p.s === symbol).map(p => p.q))]
  }
}