import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CoingeckoPairsManager } from './coingecko/CoingeckoManager'

@customElement('changes-manager')
export class ChangesManager extends LitElement {
  private _changes: { [pair: string]: number} = {}
  private _coinGeckoManager: CoingeckoPairsManager;

  constructor() {
    super()
    this._coinGeckoManager = new CoingeckoPairsManager()
  }

  // render() {
  //   return html``
  // }

  public getPairChange (symbol: string, quote: string) {
    if (quote.indexOf('USD') >= 0) {
      quote = 'USD'
    }
    // console.log(quote, this._changes[`${symbol.toLocaleLowerCase()}/${quote.toLocaleLowerCase()}`])
    return this._changes[`${symbol.toLocaleLowerCase()}/${quote.toLocaleLowerCase()}`]
  }

  public async updateChanges () {
    // Build-up the list of pairs to fetch
    // const symbols = [...new Set(window.tradesManager.sessions.map(s => s.symbol))];
    const ids  = [...new Set(window.tradesManager.sessions.map(s => s.symbol))].map(s => this._coinGeckoManager.getIdFromSymbol(s)!)
    const quotes = [...new Set(window.tradesManager.sessions.map(s => s.quote)), 'USD', 'EUR'];
    // const pairs = [...new Set(window.tradesManager.sessions.map(s => `${s.symbol}/${s.quote}`))]

    // Fetch data from coinGecko
    const results = await this._coinGeckoManager.fetch(ids, quotes)

    for (const id in results) {
      const symbol = this._coinGeckoManager.getSymbolFromId(id)
      const changeStrings = Object.keys(results[id]).filter(k => /(.+)_24h_change/.test(k))
      for (const change_string of changeStrings) {
        const quote = change_string.match(/(.+)_24h_change/)![1]
        const changeValue = results[id][change_string]
        // console.log(quote, changeValue)
        if (symbol !== undefined && quote !== undefined && changeValue !== undefined)
          this._changes[`${symbol.toLocaleLowerCase()}/${quote}`] = changeValue
      }
    }
  }
}

declare global {
  interface Window {
    ChangesManager: ChangesManager
  }
}

window.ChangesManager = new ChangesManager