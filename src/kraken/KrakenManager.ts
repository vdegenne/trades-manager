import ms from "ms";
import { Pair, PairsManager, PairsManagerInterface } from "../PairsManager";
import krakenPairs from './kraken-pairs.json'

export class KrakenManager extends PairsManager implements PairsManagerInterface {
  protected timeoutMs = ms('10s')

  isPairAvailable (symbol: string, quote: string) {
    symbol = convertSymbol(symbol)
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
      try {
        // sometimes the fetch occurs when a a pair is being added (e.g. on )
        pair.price = parseFloat(result[this.getIdFromPair(pair)!].c[0])
      } catch (e) {}
      // pair.price = parseFloat(result.find(r => r.symbol === `${pair.symbol}${pair.quote}`).price)
    }

    super.updateFunction()
  }

  getAvailableSymbols () {
    return [...new Set(krakenPairs.map(p => p.s))].map(v => convertSymbol(v, true))
  }

  getAvailableQuotesFromSymbol (symbol: string) {
    return [...new Set(krakenPairs.filter(p => p.s === convertSymbol(symbol)).map(p => p.q))]
  }

  getPairsString () {
    return this.pairs.map(p => `${p.symbol}${p.quote}`).join(',')
  }

  // getPairFromId (id: string) {
  //   const krakenPair = krakenPairs.find(p => p.id === id)
  //   return this.pairs.find(p => p.symbol === krakenPair?.s && p.quote === krakenPair?.q)
  // }

  getIdFromPair (pair: Pair) {
    return krakenPairs.find(p => p.s === convertSymbol(pair.symbol) && p.q === pair.quote)?.id
  }
}

function convertSymbol (symbol: string, reverse = false) {
  const map = reverse ? reveredConversionMap : conversionMap;
  return symbol in map ? map[symbol] : symbol;
}

const conversionMap = {
  'BTC': 'XBT'
}
const reveredConversionMap = Object.fromEntries(Object.entries(conversionMap).map(([a, b]) => [b, a]))