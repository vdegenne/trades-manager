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

  static pairExists (symbol: string, quote: string) {
    for (const exchange of Object.values(this.exchanges)) {
      if (exchange.pairExists(symbol, quote)) {
        return true;
      }
    }
    return false
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
    let exchanges = Object.values(this.exchanges)
    if (preferredExchange && preferredExchange !== 'others') {
      exchanges = [this.exchanges[preferredExchange]].concat(
        Object.entries(this.exchanges).filter(([exchangeName, exchange]) => exchangeName !== preferredExchange).map(([o, exchange]) => exchange)
      )
    }
    for (const currency of Currencies) {
      for (const exchange of exchanges) {
        if (exchange.pairExists(quote, currency) || exchange.pairExists(currency, quote)) {
          break; // next currency
        }

        // if it doesn't exist, we check if it's available
        if (exchange.isPairAvailable(quote, currency)) {
          exchange.addPair(quote, currency, false)
          break; // next currency
        }

        // or else we check if the counter pair is available
        if (exchange.isPairAvailable(currency, quote)) {
          exchange.addPair(currency, quote, false)
          break; // next currency
        }
      }
    }
  }

  static getConversionPrice (symbol: string, preferredQuote: string, preferredExchange?: AvailableExchanges) {
    const quotes = [preferredQuote].concat(Currencies.filter(c => c !== preferredQuote))
    let exchanges = Object.values(this.exchanges)
    if (preferredExchange && preferredExchange !== 'others') {
      exchanges = [this.exchanges[preferredExchange]].concat(
        Object.entries(this.exchanges).filter(([exchangeName, exchange]) => exchangeName !== preferredExchange).map(([o, exchange]) => exchange)
      )
    }
    let price: number|undefined = undefined
    for (const quote of quotes) {
      for (const exchange of exchanges) {
        // try to get the price (normal conversion)
        price = exchange.getPrice(symbol, quote)
        if (price) {
          return { quote, price }
        }
        // or else we try to get the counter pair
        price = exchange.getPrice(quote, symbol)
        if (price) {
          return { quote, price: 1/price }
        }
      }
    }
    return { quote: undefined, price: undefined }
  }

}

declare global {
  interface Window {
    exchangesManager: ExchangesManager
  }
}

window.exchangesManager = ExchangesManager