import "@material/mwc-icon/mwc-icon";
import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ExchangesManager } from "./ExchangesManager";
import { SessionViewOptions } from "./options/options";
import sessionsStyles from "./styles/sessions-styles";
import { getSessionSummary, SessionSummary, TradeSession, ValueQuote } from "./TradesManager";
import { formatOutputPrice, openCryptowatchLink, outputPriceTemplate, percentTemplate, round } from "./util";
import './change-tag'
import { timeAgo } from './time-ago';


@customElement('session-strip')
export class SessionStrip extends LitElement {
  @property({type:Object})
  public session: TradeSession;

  @property({type: Object})
  public viewOptions!: Partial<SessionViewOptions>;

  public summary?: SessionSummary;
  public hProfit?: ValueQuote; // human readable profit
  public hInvested?: ValueQuote; // human readable invested


  private zIndex!: number;

  constructor (session: TradeSession, options?: Partial<SessionViewOptions>) {
    super()
    this.session = session;
    this.viewOptions = options || {}
    // console.log('new strip created')
  }

  static styles = [
    css`
    :host {
      display: block;
    }
    `,
    sessionsStyles,
  ]

  render() {
    return this.stripTemplate(this.session)
  }

  updated() {
    this.checkAlert()
  }

  stripTemplate(session: TradeSession) {
    // const summary = getSummary(session)
    const ss = this.summary = getSessionSummary(session)
    // const total = { value: 0, quote: session.quote }
    let totalConverted: { value: number, quote: string } | undefined = undefined
    // let investedConverted: { value: number, quote: string } | undefined = undefined // added
    // let profitConverted: { value: number, quote: string } | null = null;
    this.hProfit = this.hInvested = undefined;
    // const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    // let percent;
    if (ss.price) {

      // check if we can convert the values for UI comprehension
      const quoteConversion = ExchangesManager.getConversionPrice(
          session.quote,
          window.spacesManager.space.currency,
          session.exchange
      )

      if (quoteConversion && quoteConversion.quote === window.spacesManager.space.currency) {
        this.hProfit = {
          value: ss.profit! * quoteConversion.value,
          quote: quoteConversion.quote
        }
        this.hInvested = {
          value: ss.invested * quoteConversion.value,
          quote: quoteConversion.quote
        }
        totalConverted = {
          value: ss.total! * quoteConversion.value,
          quote: quoteConversion.quote
        }
      }
      else {
        // @todo implement or else we should check if the quote is convertible from currency conversion
      }
    }

    const viewOptions = Object.assign({}, window.options.sessionViewOptions, this.viewOptions)

    const title = `
    volume: ${this.summary.volume}${session.trades.length && session.trades[0].date ? `
last trade: ${timeAgo.format(session.trades[0].date)}` : '' }${session.trades.length && session.trades[session.trades.length - 1].date ? `
first trade: ${timeAgo.format(session.trades[session.trades.length - 1].date as number)}` : '' }
    `
    // let change = window.ChangesManager.getPairChange(session.symbol, session.quote)
    // if (change !== undefined) {
    //   change = round(change)
    // }

    return html`
    <div class="session"
        ?entitled="${session.title}"
        ?eventful="${viewOptions.events}"
        ?virtual="${session.virtual}"
        @mousedown="${(e) => viewOptions.events && this.onSessionElementClick(e, session)}"
        title="${title}">

      <!-- TITLE -->
      ${ session.title ? html`
      <div class="title">${session.title}</div>
      ` : nothing }

      <div>
        <div style="display:flex;align-items:center">
          <div class="name">${session.symbol}<mwc-icon>sync_alt</mwc-icon>${session.quote}</div>
          ${session.alert ? html`<mwc-icon style="--mdc-icon-size:18px;margin-left:7px;cursor:pointer;color:${session.alert.notified ? '#f44336': 'inherit'}" title="${session.alert!.limit} ${session.alert!.value}"
              @mousedown="${(e: MouseEvent) => {e.stopPropagation();window.sessionAlert.open(window.sessionsView.getStripFromSessionElement(session)!)}}">notifications</mwc-icon>` : nothing}
        </div>
        ${viewOptions.showPrice ? html`
        <div class="price" style="display:flex;align-items:center;">
          <span>${ss.price}</span>
          <change-tag .symbol=${session.symbol} .quote=${session.quote}></change-tag>
        </div>` : nothing }

      </div>

      <!-- middle part -->
      <div style="display:flex;flex-direction:column;align-items:${viewOptions.showPercent ? 'center' : 'flex-end' };flex:1">

        <!-- GAIN -->
        <div style="display:flex;align-items:center;${viewOptions.showTotalValue ? 'margin-bottom:5px' : ''}" id="gain-tag">
          ${viewOptions.showSourceProfit || !this.hProfit ? html`
          <div>${outputPriceTemplate(ss.profit!, session.quote)}</div>
          ` : nothing }
          ${this.hProfit ? html`
          <div style="display:flex;align-items:center;margin-left:4px;">
            ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">(</span>` : nothing }
            ${outputPriceTemplate(this.hProfit.value, this.hProfit.quote)}
            ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">)</span>` : nothing }
          </div>
          ` : nothing}
          <!-- profit index -->
        </div>

        <!-- TOTAL VALUE -->
        ${viewOptions.showTotalValue ? html`
          <div class="total-value">${formatOutputPrice(ss.invested, session.quote)}</div>
          <!-- <div class="total-value">
            <span>${formatOutputPrice(ss.total!, session.quote)}</span>
            ${session.quote !== window.spacesManager.space.currency && totalConverted !== undefined ? html`
            <span>(${formatOutputPrice(totalConverted.value, totalConverted.quote)})</span>
            ` : nothing}
          </div> -->
        ` : nothing }
      </div>

      <!-- PERCENT -->
        ${viewOptions.showPercent ? percentTemplate(ss.percent!, ss.percent === -100 && ss.volume === 0) : nothing}
        <!-- <div style="width:100px;overflow:hidden;overflow-x:auto;"> -->
        <!-- </div> -->

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

  public queryGainValue () {
    return this.shadowRoot?.querySelector('#gain-tag')?.textContent
  }

  private onSessionElementClick(e: PointerEvent, session: TradeSession) {
    if (e.button === 2) {
      openCryptowatchLink(session)
    }
    else {
      window.sessionsView.openPreSessionMenu(session)
      // window.tradesInterface.openSession(session)
    }
  }


  private async checkAlert () {
    await this.updateComplete;

    // Only alert if there is actually an alert and ...
    if (this.session === undefined || this.session.alert === undefined || this.session.alert.notified) return;

    // This function returns false if something went wrong or the user denied notifications
    if (!await window.notificationService.checkPermission()) {
      // Alert not available
      return;
    }

    const gainValue = parseFloat(this.queryGainValue()?.trim()!)
    // console.log(gainValue)
    const shouldNotify = eval(`${gainValue} ${this.session.alert.limit} ${this.session.alert.value}`)
    // console.log(`${gainValue} ${this.session.alert.limit} ${this.session.alert.value}`)

    if (shouldNotify) {
      window.notificationService.notify(`${this.session.symbol} ${this.session.alert.limit} ${this.session.alert.value}`, {
        session: this.session
      })
      // notification.onclick = () => {
      //   openCryptowatchLink(this.session)
      //   notification.close()
      // }
      this.session.alert.notified = true
      this.requestUpdate()
      // we save data to persist the notified property
      window.spacesManager.save()
    }
  }
}