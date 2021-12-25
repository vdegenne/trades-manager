// import { LitElement } from 'lit';
// import { customElement } from 'lit/decorators.js';
import { BinanceManager } from './binance/BinanceManager';
import { changeTagsList } from './change-tag';
import { CoingeckoPairsManager } from './coingecko/CoingeckoManager'

declare type Change = { [pair: string]: number };
declare type Changes = {
  'binance': Change,
  'kraken': Change,
  'others': Change
}

// @customElement('changes-manager')
export class ChangesManager {
  private _changes: Partial<Changes> = {}
  private _coinGeckoManager: CoingeckoPairsManager;
  private _binanceManager: BinanceManager;

  constructor() {
    // super()
    this._coinGeckoManager = new CoingeckoPairsManager()
    this._binanceManager = new BinanceManager()

    setInterval(() => {
      this.updateChanges()
    }, 1000 * 60 * 2)
  }

  // render() {
  //   return html``
  // }

  public getPairChange (symbol: string, quote: string) {
    // if (quote.indexOf('USD') >= 0) {
    //   quote = 'USD'
    // }
    // console.log(quote, this._changes[`${symbol.toLocaleLowerCase()}/${quote.toLocaleLowerCase()}`])
    return this._changes['binance'] ? this._changes['binance'][`${symbol}${quote}`] : undefined;
  }

  public async updateChanges () {
    const changes = await this._binanceManager.fetchChanges()
    this._changes['binance'] = Object.fromEntries(changes.map(c => [c.symbol, c.priceChangePercent]))
    changeTagsList.forEach(t => t.requestUpdate())
    return
    // Build-up the list of pairs to fetch
    // const symbols = [...new Set(window.tradesManager.sessions.map(s => s.symbol))];
    const ids  = [...new Set(window.tradesManager.sessions.map(s => s.symbol))].map(s => this._coinGeckoManager.getIdFromSymbol(s)!)
    const quotes = [...new Set(window.tradesManager.sessions.map(s => s.quote)), 'USD', 'EUR'];
    // const pairs = [...new Set(window.tradesManager.sessions.map(s => `${s.symbol}/${s.quote}`))]

    // Fetch data from coinGecko
    const results = await this._coinGeckoManager.fetch(ids, quotes)

    // for (const id in results) {
    //   const symbol = this._coinGeckoManager.getSymbolFromId(id)
    //   const changeStrings = Object.keys(results[id]).filter(k => /(.+)_24h_change/.test(k))
    //   for (const change_string of changeStrings) {
    //     const quote = change_string.match(/(.+)_24h_change/)![1]
    //     const changeValue = results[id][change_string]
    //     // console.log(quote, changeValue)
    //     if (symbol !== undefined && quote !== undefined && changeValue !== undefined)
    //       this._changes[`${symbol.toLocaleLowerCase()}/${quote}`] = changeValue
    //   }
    // }
  }
}

declare global {
  interface Window {
    ChangesManager: ChangesManager
  }
}

window.ChangesManager = new ChangesManager