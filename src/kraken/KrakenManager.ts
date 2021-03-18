import ms from "ms";
import { Pair, PairsManager, PairsManagerInterface } from "../PairsManager";
import krakenPairs from './kraken-pairs.json'

export class KrakenManager extends PairsManager implements PairsManagerInterface {
  protected timeoutMs = ms('10s')

  isPairAvailable (symbol: string, quote: string) {
    return krakenPairs.some(p => {
      return p.s === symbol && p.q === quote;
    })
  }

  async updateFunction () {
    if (this.pairs.length === 0) {
      return;
    }

    const result = (await (await fetch(`https://api.kraken.com/0/public/Ticker?pair=${this.getPairsString()}`)).json()).result

    for (const pair of this.pairs) {
      pair.price = parseFloat(result[this.getIdFromPair(pair)!].c[0])
      // pair.price = parseFloat(result.find(r => r.symbol === `${pair.symbol}${pair.quote}`).price)
    }

    super.updateFunction()
  }

  getAvailableSymbols () {
    return [...new Set(krakenPairs.map(p => p.s))]
  }

  getAvailableQuotesFromSymbol (symbol: string) {
    return [...new Set(krakenPairs.filter(p => p.s === symbol).map(p => p.q))]
  }

  getPairsString () {
    return this.pairs.map(p => `${p.symbol}${p.quote}`).join(',')
  }

  // getPairFromId (id: string) {
  //   const krakenPair = krakenPairs.find(p => p.id === id)
  //   return this.pairs.find(p => p.symbol === krakenPair?.s && p.quote === krakenPair?.q)
  // }

  getIdFromPair (pair: Pair) {
    return krakenPairs.find(p => p.s === pair.symbol && p.q === pair.quote)?.id
  }
}