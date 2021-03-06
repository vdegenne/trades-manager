import { customElement, html, LitElement, property } from "lit-element";
import { nothing } from "lit-html";
import { ExchangesManager } from "./ExchangesManager";
import { SessionViewOptions } from "./options/options";
import sessionsStyles from "./styles/sessions-styles";
import { getSummary, TradeSession } from "./TradesManager";
import { formatOutputPrice, openCryptowatchLink, outputPriceTemplate, round } from "./util";

@customElement('session-strip')
export class SessionStrip extends LitElement {
  @property({type:Object})
  public session: TradeSession;

  @property({type: Object})
  public viewOptions!: Partial<SessionViewOptions>;

  public profit: number = 0;

  constructor (session: TradeSession, options?: Partial<SessionViewOptions>) {
    super()
    this.session = session;
    this.viewOptions = options || {}
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
    const summary = getSummary(session)
    const total = { value: 0, quote: session.quote }
    let totalConverted: { value: number, quote: string } | undefined = undefined
    let profitConverted: { value: number, quote: string } | undefined = undefined
    const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
    let percent;
    if (price) {
      total.value = price * summary.volume;
      this.profit = total.value - summary.invested
      percent = ((total.value - summary.invested) / summary.invested) * 100;

      // check if we should convert the values for UI comprehension
      const quoteConversion = ExchangesManager.getConversionPrice(session.quote, window.spacesManager.space.currency, session.exchange)
      if (quoteConversion.price && quoteConversion.quote === window.spacesManager.space.currency) {
        totalConverted = {
          value: total.value * quoteConversion.price,
          quote: quoteConversion.quote
        }
        profitConverted = {
          value: this.profit * quoteConversion.price,
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
          ${session.alert ? html`<mwc-icon style="--mdc-icon-size:18px;margin-left:7px;cursor:pointer;color:${session.alert.notified ? '#f44336': 'inherit'}" title="${session.alert!.limit} ${session.alert!.value}%"
              @mousedown="${(e: MouseEvent) => {e.stopPropagation();window.sessionAlert.open(window.sessionsView.getStripFromSessionElement(session)!)}}">notifications</mwc-icon>` : nothing}
        </div>
        ${viewOptions.showPrice ? html`<div class="price">${price}</div>` : nothing }
      </div>

      <!-- middle part -->
      <div style="display:flex;flex-direction:column;align-items:${viewOptions.showPercent ? 'center' : 'flex-end' };flex:1">

        <!-- GAIN -->
        <div style="display:flex;align-items:center;${viewOptions.showTotalValue ? 'margin-bottom:5px' : ''}">
          ${viewOptions.showSourceProfit || !profitConverted ? html`
          <div>${outputPriceTemplate(this.profit, session.quote)}</div>
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
        <!-- <div style="width:100px;overflow:hidden;overflow-x:auto;"> -->
          <span class="percent"
            style="background-color:${!percent ? 'grey' : percent > 0 ? 'var(--green)' : 'red'}">${round(percent, 2) || '0'}%</span>
        <!-- </div> -->
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

  private onSessionElementClick(e: PointerEvent, session: TradeSession) {
    if (e.button === 2) {
      openCryptowatchLink(session)
    }
    else {
      window.tradesInterface.openSession(session)
    }
  }


  private async checkAlert () {
    if (!this.session.alert || this.profit === 0 || this.session.alert.notified) return;

    // we should check if the user granted notifications
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
    if (Notification.permission !== 'granted') {
      return;
    }

    const shouldNotify = eval(`${this.profit} ${this.session.alert.limit} ${this.session.alert.value}`)

    if (shouldNotify) {
      const notification = new Notification(`${this.session.symbol} ${this.session.alert.limit} ${this.session.alert.value}`, {
        silent: false,
        requireInteraction: true,
      })
      notification.onclick = () => {
        openCryptowatchLink(this.session)
        notification.close()
      }
      this.session.alert.notified = true
      this.requestUpdate()
      // we save data to persist the notified property
      window.spacesManager.save()
    }
  }
}