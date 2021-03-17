import { css, customElement, html, LitElement } from "lit-element";
import { TradeManager } from "./trades";
import { TradesInterface } from "./TradesInterface";
import { round } from "./util";
import { openCryptowatchLink } from "./util";
import '@material/mwc-icon-button'


@customElement('trades-view')
export class TradesView extends LitElement {
  private interface: TradesInterface;

  constructor(tradesInterface: TradesInterface) {
    super()
    this.interface = tradesInterface;
  }

  render () {
    return html`
    ${this.interface.tradesManager.pairs.map(pair => {
      return this.pairTemplate(pair)
    })}
    `
  }

  pairTemplate (pair: string) {
    const summary = this.interface.tradesManager.getSummarizedTrade(pair)!
    let activeProfit, overallProfit;
    const coingeckoPair = this.interface.coingeckoManager.getPair(pair)
    if (coingeckoPair) {
      activeProfit = coingeckoPair.price! * summary.volume;
      overallProfit = round(summary.profit + activeProfit)
    }

    return html`
    <div class="asset"
        @mousedown="${(e:MouseEvent) => {if (e.button === 2) openCryptowatchLink(pair)}}">
      <span class="name">${pair}</span>
      <span class="profit"
        style="font-weight:500;color:${overallProfit === 0 ? 'initial' : (overallProfit > 0 ? 'green' : 'red')}">${overallProfit}€</span>
      <mwc-icon-button icon="close"
        @click="${() => this.deleteAsset(pair)}"></mwc-icon-button>
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
      this.interface.deleteAsset(assetName)
      this.requestUpdate()
      window.app.toast('asset deleted')
      this.interface.saveTrades()
    }
  }
}