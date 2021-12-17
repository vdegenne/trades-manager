// @TODO: do like Binance, dynamic page fetch
import coingeckoSymbols from '../../public/coingecko-symbols.json'
import coingeckoQuotes from './coingecko-quotes.json'
import ms from 'ms'
import { PairsManager, PairsManagerInterface} from '../PairsManager'

export class CoingeckoPairsManager extends PairsManager implements PairsManagerInterface {
  protected timeoutMs = ms('10s')

  isPairAvailable (symbol: string, quote: string) {
    if (!coingeckoSymbols.some(a => a.s === symbol)) {
      return false
    }
    if (!coingeckoQuotes.some(q => q === quote)) {
      return false
    }

    return true
  }

  // async addPair(symbol: string, quote: string, updatePairs = true) {
  //   return super.addPair(symbol, quote.toLowerCase(), updatePairs)
  // }

  buildCoingeckoAPIArguments () {
    return {
      ids: [...new Set(this.pairs.map(p => coingeckoSymbols.find(a => a.s === p.symbol)!.id))].join(','),
      vs_currencies: [...new Set(this.pairs.map(p => p.quote))].join(',')
    }
  }

  getIdFromSymbol (symbol: string) {
    const Symbol = coingeckoSymbols.find(a => a.s === symbol)
    if (!Symbol) return
    return Symbol.id;
  }
  getSymbolFromId (id: string) {
    const Symbol = coingeckoSymbols.find(s => s.id === id)
    return Symbol?.s;
  }

  async fetch(ids: string|string[], vs_currencies: string|string[]) {
    if (!(ids instanceof Array) && typeof ids === 'string') {
      ids = [ids]
    }
    if (!(vs_currencies instanceof Array) && typeof vs_currencies === 'string') {
      vs_currencies = [vs_currencies]
    }
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vs_currencies.join(',')}&include_24hr_change=true`)
    return await response.json()
  }

  async updateFunction () {
    const {ids, vs_currencies} = this.buildCoingeckoAPIArguments()

    if (!ids || !vs_currencies) {
      return
    }

    // const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=true`)
    // const result = await response.json()
    // const result = await this.fetch(ids, vs_currencies)
    const result = await this.fetch(ids, vs_currencies)

    for (const pair of this.pairs) {
      const id = this.getIdFromSymbol(pair.symbol)
      if (!id) continue
      pair.price = result[id][pair.quote.toLowerCase()]
    }

    super.updateFunction()
  }

  getAvailableSymbols () {
    return [...new Set(coingeckoSymbols.map(s => s.s))]
  }

  getAvailableQuotesFromSymbol (symbol: string) {
    return coingeckoQuotes;
  }
}