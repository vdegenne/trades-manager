import { KrakenManager } from './kraken/KrakenManager';
import { BinanceManager } from "./binance/BinanceManager";
import { CoingeckoPairsManager } from "./coingecko/CoingeckoManager";
import { PairsManager } from "./PairsManager"
import { TradeSession } from "./trades";

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
  };

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
      // for (const trade of session.trades) {
        // false here means "don't call the update routine"
        this.exchanges[session.exchange].addPair(session.symbol, session.quote, false)
      // }
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
    await this.exchanges[exchangeName].addPair(symbol, quote, updatePairs)
  }
}

declare global {
  interface Window {
    exchangesManager: ExchangesManager
  }
}

window.exchangesManager = ExchangesManager