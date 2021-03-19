import { KrakenManager } from './kraken/KrakenManager';
import { BinanceManager } from "./binance/BinanceManager";
import { CoingeckoPairsManager } from "./coingecko/CoingeckoManager";
import { PairsManager } from "./PairsManager"
import { TradeSession } from "./trades";
import { Currencies } from './app-container';

export type Exchange = PairsManager;
export type Exchanges = {
  [key in 'kraken'|'binance'|'others']: Exchange
}
export type AvailableExchanges = keyof Exchanges;

export class ExchangesManager {
  // order matters !
  static exchanges: Exchanges = {
    'kraken': new KrakenManager,
    'binance': new BinanceManager,
    'others': new CoingeckoPairsManager
  }

  static getAvailableExchanges () {
    return Object.keys(this.exchanges)
  }

  static getAvailableSymbols (exchangeName: string) {
    return (this.exchanges[exchangeName] as Exchange).getAvailableSymbols()
  }

  static getAvailableQuotesFromSymbol (exchangeName: string, symbol: string) {
    return this.exchanges[exchangeName].getAvailableQuotesFromSymbol(symbol)
  }


  static initializeExchangesFromSessions (sessions: TradeSession[]) {
    for (const session of sessions) {
      this.addPair(session.exchange, session.symbol, session.quote, false)
    }
  }

  static startUpdateRoutines () {
    for (const manager of Object.values(this.exchanges)) {
      manager.updatePairs()
    }
  }

  static getPrice (exchangeName: AvailableExchanges, symbol: string, quote: string) {
    return this.exchanges[exchangeName].getPrice(symbol, quote)
  }

  static async addPair (exchangeName: AvailableExchanges, symbol: string, quote: string, updatePairs = true) {
    this.registerQuoteForConversion(symbol, exchangeName)
    this.registerQuoteForConversion(quote, exchangeName)
    await this.exchanges[exchangeName].addPair(symbol, quote, updatePairs)
  }

  static registerQuoteForConversion (quote: string, preferredExchange?: AvailableExchanges) {
    for (const currency of Currencies) {
      // if there is a preferred exchange we should first check if the pair exists there
      // unless it's "others" (coingecko which is slow)
      if (preferredExchange && preferredExchange !== 'others') {
        const exchange = this.exchanges[preferredExchange]
        if (exchange.pairExists(quote, currency))
          continue;

        if (exchange.isPairAvailable(quote, currency)) {
          exchange.addPair(quote, currency, false)
          continue
        }
      }
      
      // if it exists somewhere we pass
      if (this.pairExists(quote, currency))
        continue;

      // or else we just check everywhere if we can add it
      for (const exchange of Object.values(this.exchanges)) {
        if (exchange.isPairAvailable(quote, currency)) {
          exchange.addPair(quote, currency, false)
          break
        }
      }
    }
  }

  static pairExists (symbol: string, quote: string) {
    for (const exchange of Object.values(this.exchanges)) {
      if (exchange.pairExists(symbol, quote)) {
        return true;
      }
    }
    return false
  }
}

declare global {
  interface Window {
    exchangesManager: ExchangesManager
  }
}

window.exchangesManager = ExchangesManager