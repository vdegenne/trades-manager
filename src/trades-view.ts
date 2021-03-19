import { css, customElement, html, LitElement } from "lit-element";
import { nothing } from 'lit-html'
import { Trade, TradeManager, TradeSession } from "./trades";
import { TradesInterface } from "./trades-interface";
import { firstLetterUpperCase, formatQuote, round } from "./util";
import { openCryptowatchLink } from "./util";
import '@material/mwc-icon-button'
import { ExchangesManager } from "./ExchangesManager";
import { ProfitAggregator, Aggregator } from "./profit-aggregator";


@customElement('trades-view')
export class TradesView extends LitElement {
  private interface: TradesInterface;

  private aggregator!: ProfitAggregator;

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
  .exchange-frame:not(:last-of-type) {
    margin-bottom: 24px;
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
  .session > .name {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    width: 60px;
    text-align: left
  }
  .session > .name > mwc-icon {
    margin: 0 5px;
    color: #bdbdbd;
  }
  .session > mwc-icon-button {
    --mdc-icon-size: 24px;
    --mdc-icon-button-size: 32px;
  }
  `

  render () {
    this.aggregator = new ProfitAggregator()

    return html`
    ${ExchangesManager.getAvailableExchanges().map(exchange => {
      const sessions = this.interface.tradesManager.sessions.filter(session => session.exchange === exchange)

      if (sessions.length === 0) return nothing

      return html`
      <div class="exchange-frame">
        <p>${firstLetterUpperCase(exchange)}</p>
        ${sessions.map(session => {
          return this.sessionTemplate(session)
        })}
      </div>
      `
    })}

    ${(() => console.log(this.aggregator))()}
    `
  }

  sessionTemplate (session: TradeSession) {
    const summary = this.interface.tradesManager.getSummarizedSessionTrades(session)
    let activeProfit, overallProfit;
    const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    if (price) {
      activeProfit = price * summary.volume;
      overallProfit = round(summary.profit + activeProfit, 5)
      this.aggregator.pushUnit(session.exchange, session.quote, overallProfit)
    }

    return html`
    <div class="session"
        @mousedown="${(e) => this.onSessionElementClick(e, session)}">
      <div class="name">${session.symbol}<mwc-icon>sync_alt</mwc-icon>${session.quote}</div>
      <div>
        <span>${summary.volume} ${session.symbol}</span>
        <span>/</span>
        <span class="profit"
          style="font-weight:500;color:${overallProfit === 0 ? 'initial' : (overallProfit > 0 ? 'green' : 'red')}">${overallProfit === 0 ? '' : overallProfit > 0 ? '+' : ''} ${overallProfit}${formatQuote(session.quote)}</span>
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
      this.interface.sessionsInterface.open(session)
    }
  }
}