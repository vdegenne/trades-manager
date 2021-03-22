import { css, customElement, html, LitElement } from "lit-element";
import { nothing } from 'lit-html'
import { Trade, TradeManager, TradeSession } from "./trades";
import { TradesInterface } from "./trades-interface";
import { aggregationTemplate, firstLetterUpperCase, formatOutputAggregation, formatOutputPrice, formatQuote, outputPriceTemplate, round } from "./util";
import { openCryptowatchLink } from "./util";
import '@material/mwc-icon-button'
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { Aggregator } from "./profit-aggregator";
import { WalletsManager } from "./WalletsManager";


@customElement('trades-view')
export class TradesView extends LitElement {
  private interface: TradesInterface;

  private profitAggregator!: Aggregator;
  private totalValueAggregator!: Aggregator;
  private walletAggregator!: Aggregator;

  constructor(tradesInterface: TradesInterface) {
    super()
    this.interface = tradesInterface;
  }

  static styles = css`
  :host {
    display: block;
    max-width: 1024px;
    margin: 0 auto;
  }
  .exchange-frame {
    margin-bottom: 62px;
  }
  .exchange-frame > p:first-of-type {
    margin-left: 12px;
    font-weight: 500;
    color: var(--mdc-theme-primary);
  }
  .session {
    display: flex;
    align-items: center;
    padding: 11px;
    background-color: #eeeeee;
    justify-content: space-between;
    margin: 5px 0;
    cursor: pointer;
    transition: background-color linear .2s;
    border-radius: 5px;
  }
  .session:hover {
    background-color: #e4e4e4;
  }
  .session .name {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    width: 60px;
    text-align: left
  }
  .session .name > mwc-icon {
    margin: 0 5px;
    color: #bdbdbd;
  }
  .session .price {
    font-size: 12px;
    color: grey;
    margin: 4px 0 0;
  }
  .session > mwc-icon-button {
    --mdc-icon-size: 24px;
    --mdc-icon-button-size: 32px;
  }
  `

  render () {
    return html`
    ${ExchangesManager.getAvailableExchanges().map(exchange => {
      const sessions = this.interface.tradesManager.sessions.filter(session => session.exchange === exchange)

      this.profitAggregator = new Aggregator(exchange)
      this.totalValueAggregator = new Aggregator(exchange)
      this.walletAggregator = new Aggregator(exchange)

      // if (sessions.length === 0) return nothing

      return html`
      <div class="exchange-frame">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <mwc-button unelevated dense>${firstLetterUpperCase(exchange)}</mwc-button>
          <mwc-button outlined icon="add" dense
            @click="${() => window.sessionInterface.createDialog.open(exchange)}">add pair</mwc-button>
        </div>

        ${sessions.map(session => this.sessionTemplate(session))}

        ${window.walletsManager.walletTemplate(this.walletAggregator)}

        ${(() => {
          this.profitAggregator.resolveQuotes(window.spacesManager.space.currency)
          this.totalValueAggregator.resolveQuotes(window.spacesManager.space.currency)
          this.walletAggregator.resolveQuotes(window.spacesManager.space.currency)

          return html`
          <div style="display:flex;align-items:center;justify-content:space-between;background-color:var(--mdc-theme-primary);padding:12px;border-radius:5px">
            <div style="color:white">
              <span>Total : </span><span style="color:#41ecd4">${formatOutputAggregation(this.totalValueAggregator)}</span>
            </div>
            <div>
            ${aggregationTemplate(this.profitAggregator, true)}
            </div>
          </div>
          `
        })()}
      </div>
      `
    })}

    `
  }

  sessionTemplate (session: TradeSession, outsideTemplate = false) {
    const summary = this.interface.tradesManager.getSummarizedSessionTrades(session)
    let profit, totalInvested;
    const total = { value: 0, quote: session.quote }
    let totalConverted: { value: number, quote: string }|undefined = undefined
    const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    if (price) {
      total.value = price * summary.volume;
      profit = total.value - summary.invested
      totalInvested = total.value - profit;
      const totalValueConversion = ExchangesManager.getConversionPrice(session.quote, window.spacesManager.space.currency, session.exchange)
      if (totalValueConversion.price && totalValueConversion.quote === window.spacesManager.space.currency) {
        totalConverted = {
          value: total.value * totalValueConversion.price,
          quote: totalValueConversion.quote
        }
      }
      else {
        // @todo implement or else we should check if the quote is convertible from currency conversion
      }
      this.profitAggregator.pushUnit(session.quote, profit)
      const totalObject = totalConverted || total;
      this.totalValueAggregator.pushUnit(totalObject.quote, totalObject.value)
      this.walletAggregator.pushUnit(session.symbol, summary.volume)
    }

    return html`
    <div class="session"
        @mousedown="${(e) => this.onSessionElementClick(e, session)}">
      <div>
        <div class="name">${session.symbol}<mwc-icon>sync_alt</mwc-icon>${session.quote}</div>
        <div class="price">${price}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="margin-bottom:5px">${outputPriceTemplate(profit, session.quote)}</div>
        <div style="font-size:14px;color:#3f51b5">
          <span>${formatOutputPrice(total.value, total.quote)}</span>
          ${total.quote !== window.spacesManager.space.currency && totalConverted !== undefined ? html`
          <span>(${formatOutputPrice(totalConverted.value, totalConverted.quote)})</span>
          ` : nothing}
        </div>
      </div>
      <mwc-icon-button icon="close"
        @mousedown="${e => e.stopPropagation()}"
        @click="${() => this.interface.removeSession(session)}"></mwc-icon-button>
    </div>
    <style>
    </style>
    `
  }

  private onSessionElementClick (e: PointerEvent, session: TradeSession) {
    if (e.button === 2) {
      openCryptowatchLink(session)
    }
    else {
      this.interface.sessionsInterface.openSession(session)
    }
  }

  private updateWalletIfNecessary () {

  }
}