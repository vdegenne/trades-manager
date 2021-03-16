import { css, customElement, html, LitElement } from "lit-element";
import { TradeManager } from "./trades";
import { round } from "./util";
import { openCryptowatchLink } from "./util";


@customElement('trades-view')
export class TradesView extends LitElement {
  private trades: TradeManager;

  constructor(tradeManager?: TradeManager) {
    super()
    this.trades = tradeManager || new TradeManager()
  }

  render () {
    return html`
    ${this.trades.assets.map(asset => {
      return this.assetTemplate(asset)
    })}
    `
  }

  assetTemplate (assetName: string) {
    const summary = this.trades.getSummarizedTrade(assetName)!
    const activeProfit = window.app.cryptos.find(c => c.name === assetName)!.getLastPrice()! * summary.volume;
    const overallProfit = round(summary.profit + activeProfit)

    return html`
    <div class="asset"
        @mousedown="${(e:MouseEvent) => {if (e.button === 2) openCryptowatchLink(assetName)}}">
      <span class="name">${assetName}</span>
      <span class="profit"
        style="font-weight:500;color:${overallProfit === 0 ? 'initial' : (overallProfit > 0 ? 'green' : 'red')}">${overallProfit}€</span>
      <mwc-icon-button icon="close"
        @click="${() => this.deleteAsset(assetName)}"></mwc-icon-button>
    </div>
    <style>
      .asset {
        display: flex;
        align-items: center;
        padding: 0 0 0 14px;
        background-color: #eeeeee;
        justify-content: space-between;
        margin: 1px 0;
      }
      .asset > .name {
        font-size: 16px;
        font-weight: 500;
        width: 60px;
        text-align: left
      }
    </style>
    `
  }

  deleteAsset (assetName: string) {
    const accept = window.confirm('Are you sure ?')
    if (accept) {
      this.trades.deleteAsset(assetName)
      this.requestUpdate()
      window.app.toast('asset deleted')
      this.saveTrades()
    }
  }

  saveTrades () {
    localStorage.setItem('trades', this.trades.toString())
  }
}