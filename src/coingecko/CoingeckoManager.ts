import coingeckoSymbols from './coingecko-symbols.json'
import coingeckoQuotes from './coingecko-quotes.json'
import ms from 'ms'
import {Pair, PairsManager, PairsManagerInterface} from '../PairsManager'

export class CoingeckoPairsManager extends PairsManager implements PairsManagerInterface {
  protected timeoutMs = ms('10s')

  isPairAvailable (symbol: string, quote: string) {
    if (!coingeckoSymbols.some(a => a.s === symbol)) {
      // window.app.toast('This symbol doesn\'t exist')
      return false
    }
    if (!coingeckoQuotes.some(q => q === quote)) {
      // window.app.toast('This currency doesn\'t exist')
      return false
    }

    return true
  }

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

  async updateFunction () {
    const {ids, vs_currencies} = this.buildCoingeckoAPIArguments()

    if (!ids || !vs_currencies) {
      return
    }
    
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`)
    const result = await response.json()

    for (const pair of this.pairs) {
      const id = this.getIdFromSymbol(pair.symbol)
      if (!id) continue
      pair.price = result[id][pair.quote]
    }

    super.updateFunction()
  }

  getAvailableSymbols () {
    return coingeckoSymbols.map(s => s.s)
  }

  getAvailableQuotesFromSymbol (symbol: string) {
    return coingeckoQuotes;
  }
}