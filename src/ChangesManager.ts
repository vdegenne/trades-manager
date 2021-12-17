import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CoingeckoPairsManager } from './coingecko/CoingeckoManager'

@customElement('changes-manager')
export class ChangesManager extends LitElement {
  private _changes: { [pair: string]: number[]} = {}
  public _coinGeckoManager: CoingeckoPairsManager;

  constructor() {
    super()
    this._coinGeckoManager = new CoingeckoPairsManager()
  }

  render() {
    return html``
  }

  public addPairForChanges (pairName: string) {
    if (!(pairName in this._changes)) {
      this._changes[pairName] = []
    }
  }

  public getPairChange (pairSymbol: string, pairQuote: string) {
    return this._changes[pairName]
  }

  public updateChanges () {
    // Build-up the list of pairs to fetch

    // Fetch data from coinGecko

    // Update the list
  }
}

// @ts-ignore
window.ChangesManager = new ChangesManager