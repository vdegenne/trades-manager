import { css, customElement, html, LitElement } from "lit-element";
import { nothing } from 'lit-html'
import { getSummary, Trade, TradesManager, TradeSession } from "./TradesManager";
import { aggregationTemplate, firstLetterUpperCase, formatOutputAggregation, formatOutputPrice, outputPriceTemplate, round } from "./util";
import { openCryptowatchLink } from "./util";
import '@material/mwc-icon-button'
import { ExchangesManager } from "./ExchangesManager";
import { Aggregator } from "./profit-aggregator";
import { SessionViewOptions } from "./options/options";
import sessionsStyles from "./styles/sessions-styles";


@customElement('sessions-view')
export class SessionsView extends LitElement {
  private profitAggregator!: Aggregator;
  private totalValueAggregator!: Aggregator;
  private walletAggregator!: Aggregator;

  constructor () {
    super()
    window.sessionsView = this;
  }

  static styles = [
    sessionsStyles,
    css`
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
    }`
  ]

  render() {
    return html`
    ${ExchangesManager.getAvailableExchanges().map(exchange => {
      const sessions = window.sessions.filter(session => session.exchange === exchange)

      this.profitAggregator = new Aggregator(exchange)
      this.totalValueAggregator = new Aggregator(exchange)
      this.walletAggregator = new Aggregator(exchange)

      // if (sessions.length === 0) return nothing

      return html`
      <div class="exchange-frame">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <mwc-button unelevated dense>${firstLetterUpperCase(exchange)}</mwc-button>
          <mwc-button outlined icon="add"
            @click="${() => window.tradesInterface.createDialog.open(exchange)}">add pair</mwc-button>
        </div>

        ${sessions.map(session => this.sessionTemplate(session))}

        ${window.options.exchangeViewOptions.showWallet ? window.walletsManager.walletTemplate(this.walletAggregator) : nothing}

        ${(() => {
          this.profitAggregator.resolveQuotes(window.spacesManager.space.currency)
          this.totalValueAggregator.resolveQuotes(window.spacesManager.space.currency)
          this.walletAggregator.resolveQuotes(window.spacesManager.space.currency)

          if (this.totalValueAggregator.units.length === 0) return nothing;

          return html`
          <div style="display:flex;align-items:center;justify-content:space-between;background-color:var(--mdc-theme-primary);padding:12px;border-radius:5px">
            <div style="color:white">
              <span>Total : </span><span style="color:#9bf1e5">${formatOutputAggregation(this.totalValueAggregator)}</span>
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

  sessionTemplate(session: TradeSession, external = false, viewOptions = window.options.sessionViewOptions) {
    const summary = getSummary(session)
    let profit, totalInvested;
    const total = { value: 0, quote: session.quote }
    let totalConverted: { value: number, quote: string } | undefined = undefined
    let profitConverted: { value: number, quote: string } | undefined = undefined
    const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    let percent;
    if (price) {
      total.value = price * summary.volume;
      profit = total.value - summary.invested
      percent = ((total.value - summary.invested) / summary.invested) * 100;

      // check if we should convert the values for UI comprehension
      const quoteConversion = ExchangesManager.getConversionPrice(session.quote, window.spacesManager.space.currency, session.exchange)
      if (quoteConversion.price && quoteConversion.quote === window.spacesManager.space.currency) {
        totalConverted = {
          value: total.value * quoteConversion.price,
          quote: quoteConversion.quote
        }
        profitConverted = {
          value: profit * quoteConversion.price,
          quote: quoteConversion.quote
        }
      }
      else {
        // @todo implement or else we should check if the quote is convertible from currency conversion
      }

      /* Aggregators */
      if (!external) {
        this.profitAggregator.pushUnit(session.quote, profit)
        const totalObject = totalConverted || total;
        this.totalValueAggregator.pushUnit(totalObject.quote, totalObject.value)
        this.walletAggregator.pushUnit(session.symbol, summary.volume)
      }
    }

    return html`
    <div class="session" style="cursor:${viewOptions.events ? 'pointer' : 'initial'};transition:${viewOptions.events ? 'background-color linear .2s;' : 'none'}"
        @mousedown="${(e) => viewOptions.events && this.onSessionElementClick(e, session)}">
      <div>
        <div class="name">${session.symbol}<mwc-icon>sync_alt</mwc-icon>${session.quote}</div>
        ${viewOptions.showPrice ? html`<div class="price">${price}</div>` : nothing }
      </div>

      <!-- middle part -->
      <div style="display:flex;flex-direction:column;align-items:${viewOptions.showPercent ? 'center' : 'flex-end' };flex:1">

        <!-- GAIN -->
        <div style="display:flex;align-items:center;margin-bottom:5px">
          ${viewOptions.showSourceProfit || !profitConverted ? html`
          <div>${outputPriceTemplate(profit, session.quote)}</div>
          ` : nothing }
          ${profitConverted ? html`
          <div style="display:flex;align-items:center;margin-left:4px;">
            ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">(</span>` : nothing }
            ${outputPriceTemplate(profitConverted.value, profitConverted.quote)}
            ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">)</span>` : nothing }
          </div>
          ` : nothing}
        </div>

        <!-- TOTAL VALUE -->
        ${viewOptions.showTotalValue ? html`
          <div class="total-value">
            <span>${formatOutputPrice(total.value, total.quote)}</span>
            ${total.quote !== window.spacesManager.space.currency && totalConverted !== undefined ? html`
            <span>(${formatOutputPrice(totalConverted.value, totalConverted.quote)})</span>
            ` : nothing}
          </div>
        ` : nothing }
      </div>

      <!-- PERCENT -->
        ${viewOptions.showPercent ? html`
        <span class="percent"
          style="background-color:${!percent ? 'grey' : percent > 0 ? 'var(--green)' : 'red'}">${round(percent, 2) || '0'}%</span>
        ` : nothing }

      ${viewOptions.showCross ? html`
        <mwc-icon-button icon="close"
          style="color:#bdbdbd"
          @mousedown="${e => e.stopPropagation()}"
          @click="${() => viewOptions.events && window.sessionsInterface.deleteSession(session)}"></mwc-icon-button>
      ` : nothing }
    </div>
    <style>
      [hide] {
        display:none;
      }
    </style>
    `
  }

  sessionExternalTemplate(session: TradeSession, viewOptions?: SessionViewOptions) {
    return this.sessionTemplate(session, true, viewOptions)
  }

  private onSessionElementClick(e: PointerEvent, session: TradeSession) {
    if (e.button === 2) {
      openCryptowatchLink(session)
    }
    else {
      window.tradesInterface.openSession(session)
    }
  }
}

declare global {
  interface Window {
    sessionsView: SessionsView;
  }
}