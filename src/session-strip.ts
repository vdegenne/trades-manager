
import "@material/mwc-icon/mwc-icon";import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ExchangesManager } from "./ExchangesManager";
import { SessionViewOptions } from "./options/options";
import sessionsStyles from "./styles/sessions-styles";
import { getSessionSummary, getSummary, SessionSummary, TradeSession } from "./TradesManager";
import { formatOutputPrice, openCryptowatchLink, outputPriceTemplate, percentTemplate, round } from "./util";

@customElement('session-strip')
export class SessionStrip extends LitElement {
  @property({type:Object})
  public session: TradeSession;

  @property({type: Object})
  public viewOptions!: Partial<SessionViewOptions>;

  public summary?: SessionSummary;

  constructor (session: TradeSession, options?: Partial<SessionViewOptions>) {
    super()
    this.session = session;
    this.viewOptions = options || {}
    console.log('new strip created')
  }

  static styles = [
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
    let investedConverted: { value: number, quote: string } | undefined = undefined // added
    let profitConverted: { value: number, quote: string } | null = null;
    // const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    // let percent;
    if (ss.price) {

      // check if we can convert the values for UI comprehension
      const quoteConversion = ExchangesManager.getConversionPrice(session.quote, window.spacesManager.space.currency, session.exchange)
      if (quoteConversion.price && quoteConversion.quote === window.spacesManager.space.currency) {
        investedConverted = { // added
          value: ss.invested * quoteConversion.price,
          quote: quoteConversion.quote
        }
        totalConverted = {
          value: ss.total! * quoteConversion.price,
          quote: quoteConversion.quote
        }
        profitConverted = {
          value: ss.profit! * quoteConversion.price,
          quote: quoteConversion.quote
        }
      }
      else {
        // @todo implement or else we should check if the quote is convertible from currency conversion
      }
    }

    const viewOptions = Object.assign({}, window.options.sessionViewOptions, this.viewOptions)

    return html`
    <div class="session"
        ?entitled="${session.title}"
        ?eventful="${viewOptions.events}"
        ?virtual="${session.virtual}"
        @mousedown="${(e) => viewOptions.events && this.onSessionElementClick(e, session)}">

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
        ${viewOptions.showPrice ? html`<div class="price">${ss.price}</div>` : nothing }
      </div>

      <!-- middle part -->
      <div style="display:flex;flex-direction:column;align-items:${viewOptions.showPercent ? 'center' : 'flex-end' };flex:1">

        <!-- GAIN -->
        <div style="display:flex;align-items:center;${viewOptions.showTotalValue ? 'margin-bottom:5px' : ''}" id="gain-tag">
          ${viewOptions.showSourceProfit || !profitConverted ? html`
          <div>${outputPriceTemplate(ss.profit!, session.quote)}</div>
          ` : nothing }
          ${profitConverted ? html`
          <div style="display:flex;align-items:center;margin-left:4px;">
            ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">(</span>` : nothing }
            ${outputPriceTemplate(profitConverted.value, profitConverted.quote)}
            ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">)</span>` : nothing }
          </div>
          ` : nothing}
          <!-- profit index -->
        </div>

        <!-- TOTAL VALUE -->
        ${viewOptions.showTotalValue ? html`
          <div class="total-value">${formatOutputPrice(ss.invested, session.quote)}</div>
          <!-- <div class="total-value">
            <span>${formatOutputPrice(ss.total!, session.quote)}yo</span>
            ${session.quote !== window.spacesManager.space.currency && totalConverted !== undefined ? html`
            <span>(${formatOutputPrice(totalConverted.value, totalConverted.quote)})</span>
            ` : nothing}
          </div> -->
        ` : nothing }
      </div>

      <!-- PERCENT -->
        ${viewOptions.showPercent ? percentTemplate(ss) : nothing}
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
    // Only alert if there is actually an alert and ...
    if (this.session.alert === undefined || this.session.alert.notified) return;

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