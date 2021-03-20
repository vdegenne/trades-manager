import { css, customElement, html, LitElement } from "lit-element";
import { nothing } from 'lit-html'
import { Trade, TradeManager, TradeSession } from "./trades";
import { TradesInterface } from "./trades-interface";
import { firstLetterUpperCase, formatOutputPrice, formatQuote, outputPriceTemplate, round } from "./util";
import { openCryptowatchLink } from "./util";
import '@material/mwc-icon-button'
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { Aggregator } from "./profit-aggregator";


@customElement('trades-view')
export class TradesView extends LitElement {
  private interface: TradesInterface;

  private profitAggregator!: Aggregator;
  private investmentAggregator!: Aggregator;

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
    margin-bottom: 32px;
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

      this.profitAggregator = new Aggregator(exchange as AvailableExchanges)
      this.investmentAggregator = new Aggregator(exchange as AvailableExchanges)

      // if (sessions.length === 0) return nothing

      return html`
      <div class="exchange-frame">
        <p>${firstLetterUpperCase(exchange)}</p>
        ${sessions.map(session => {
          return this.sessionTemplate(session)
        })}

        ${window.walletsManager.walletTemplate(exchange)}

        ${(() => {
          this.profitAggregator.resolveQuotes(window.spacesManager.space.currency)
          return this.aggregationTemplate(this.profitAggregator)
        })()}
      </div>
      `
    })}

    `
  }

  sessionTemplate (session: TradeSession) {
    const summary = this.interface.tradesManager.getSummarizedSessionTrades(session)
    let activeProfit, overallProfit;
    const investment = { total: summary.investment, quote: session.quote };
    const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    if (price) {
      activeProfit = price * summary.volume;
      overallProfit = summary.profit + activeProfit
      const investmentConversion = ExchangesManager.getConversionPrice(session.quote, window.spacesManager.space.currency, session.exchange)
      if (investmentConversion.price && investmentConversion.quote === window.spacesManager.space.currency) {
        investment.total *= investmentConversion.price;
        investment.quote = investmentConversion.quote;
      }
      else {
        // @todo implement or else we should check if the quote is convertible from currency conversion
      }
      this.profitAggregator.pushUnit(session.quote, overallProfit)
    }

    return html`
    <div class="session"
        @mousedown="${(e) => this.onSessionElementClick(e, session)}">
      <div>
        <div class="name">${session.symbol}<mwc-icon>sync_alt</mwc-icon>${session.quote}</div>
        <div class="price">${price}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center">
        <div style="font-size:14px;margin-bottom:5px;color:#3f51b5">${formatOutputPrice(investment.total, investment.quote)}</div>
        <!-- <div>${investment.total}</div> -->
        <div>${outputPriceTemplate(overallProfit, session.quote)}</div>
      </div>
      <mwc-icon-button icon="close"
        @mousedown="${e => e.stopPropagation()}"
        @click="${() => this.interface.removeSession(session)}"></mwc-icon-button>
    </div>
    <style>
    </style>
    `
  }

  aggregationTemplate (aggregator: Aggregator) {
    return html`
    <div style="display:flex;align-items:center;justify-content:space-between;background-color:#eeeeee;border:2px solid #e0e0e0;border-top:none;color:white;padding:12px;padding-top:6px;border-radius:0 0 5px 5px;box-shadow:0px 5px 10px -2px #e0e0e0">
      <div></div>
      ${aggregator.units.map((agg, i) => {
        return html`${outputPriceTemplate(agg[1], agg[0])}
        ${i < aggregator.units.length - 1 ? html`<span> + </span>` : nothing }
        `
      })}
      <div></div>
    </div>
    `
  }

  private onSessionElementClick (e: PointerEvent, session: TradeSession) {
    if (e.button === 2) {
      openCryptowatchLink(session)
    }
    else {
      this.interface.sessionsInterface.open(session)
    }
  }
}