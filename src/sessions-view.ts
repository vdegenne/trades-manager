import { css, html, LitElement, nothing, render } from 'lit';
import { customElement, query, queryAll } from 'lit/decorators.js';
import{ live } from 'lit/directives/live.js'
import { getSummary, Trade, TradesManager, TradeSession, getSessionSummary } from "./TradesManager";
import { firstLetterUpperCase, formatOutputPrice, openChart, openVirtualInfoDialog, outputPriceTemplate, round } from "./util";
// import { openCryptowatchLink } from "./util";
import '@material/mwc-icon-button'
import { ExchangesManager } from "./ExchangesManager";
import { Aggregator } from "./profit-aggregator";
// import { SessionViewOptions } from "./options/options";
import sessionsStyles from "./styles/sessions-styles";
import './session-strip'
import '@material/mwc-button'
import { SessionStrip } from "./session-strip";
import { Dialog } from "@material/mwc-dialog";
import '@material/mwc-icon'
import './total-strip'
import { TotalStrip } from './total-strip';
import { SessionCreateDialog } from './session-create-dialog';

@customElement('sessions-view')
export class SessionsView extends LitElement {
  // private profitAggregator!: Aggregator;
  // private totalValueAggregator!: Aggregator;
  // private walletAggregator!: Aggregator;

  @query('mwc-dialog') dialog!: Dialog;
  @query('session-create-dialog') createDialog!: SessionCreateDialog;

  @queryAll('session-strip') stripElements!: SessionStrip[];
  @queryAll('total-strip') totalStripElements!: TotalStrip[];

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

    if (window.sessions === undefined) {
      return nothing;
    }

    let zIndex = window.sessions.length;

    return html`
    ${ExchangesManager.getAvailableExchanges().map(exchange => {
      /* Get the sessions (per exchange) */
      const sessions = window.sessions.filter(s => {
        if (s.exchange !== exchange) return false;
        if (window.options.exchangeViewOptions.showVirtual === false && s.virtual) return false
        if (window.options.exchangeViewOptions.showTerminatedSession === false) {
          const summary = getSummary(s)
          if (s.trades.length > 0 && summary.volume === 0) return false
        }
        return true
      })

      let ordered;
      switch (window.options.exchangeViewOptions.sortBy) {
        case '24hr':
        ordered = sessions.sort((a, b) => {
          return (window.ChangesManager.getPairChange(b.symbol, b.quote) || 0) - (window.ChangesManager.getPairChange(a.symbol, a.quote) || 0)
        })
        break;

        case 'percent':
        ordered = sessions.map(s => ({s, ...getSessionSummary(s)})).sort((a, b) => {
          return b.percent! - a.percent!
        }).map(o => o.s)
        break;
      }
      // console.log(ordered)

      return html`
      <div class="exchange-frame">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <!-- <mwc-button unelevated dense
            style="">${firstLetterUpperCase(exchange)}</mwc-button> -->
          <span style="font-size:0.9em;color:white;background-color:black;padding:5px 10px;">${firstLetterUpperCase(exchange)}</span>
          <total-strip .exchange=${exchange} style="flex:1"></total-strip>
        </div>


        ${ordered.map(o => {
          zIndex--;
          return html`<session-strip .session=${o} .zIndex=${zIndex}></session-strip>`
        })}


        <mwc-button unelevated icon="add"
          @click="${() => this.createDialog.open(exchange)}"
          style="--mdc-theme-primary:var(--on-background-color);--mdc-theme-on-primary:var(--main-text-color);border-radius:5px;display:flex;margin-top:12px;">add session</mwc-button>
      </div>
      `
    })}

    <!-- pre-session menu dialog placeholder -->
    <mwc-dialog></mwc-dialog>

    <session-create-dialog></session-create-dialog>

    `
  }

  requestUpdate(name?: PropertyKey, oldValue?: unknown) {
    try {
      this.stripElements.forEach(el => el.requestUpdate())
    } catch (e) {}
    return super.requestUpdate(name, oldValue)
  }

  async updated() {
    for (const exchange of ExchangesManager.getAvailableExchanges()) {
      const strips = [...this.stripElements].filter(el => el.session.exchange === exchange && !el.session.virtual);
      if (strips.length === 0) continue
      await Promise.all([].map.call(strips, (e: SessionStrip) => e.updateComplete));

      const totalStrip = [...this.totalStripElements].find(s => s.exchange === exchange)!
      totalStrip.aggregateFromStrips(strips)
    }
  }


  // sessionTemplate(session: TradeSession, external = false, viewOptions: Partial<SessionViewOptions> = window.options.sessionViewOptions) {
  //   const summary = getSummary(session)
  //   let profit, totalInvested;
  //   const total = { value: 0, quote: session.quote }
  //   let totalConverted: { value: number, quote: string } | undefined = undefined
  //   let profitConverted: { value: number, quote: string } | undefined = undefined
  //   const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
  //   let percent;
  //   if (price) {
  //     total.value = price * summary.volume;
  //     profit = total.value - summary.invested
  //     percent = ((total.value - summary.invested) / summary.invested) * 100;

  //     // check if we should convert the values for UI comprehension
  //     const quoteConversion = ExchangesManager.getConversionPrice(session.quote, window.spacesManager.space.currency, session.exchange)
  //     if (quoteConversion.price && quoteConversion.quote === window.spacesManager.space.currency) {
  //       totalConverted = {
  //         value: total.value * quoteConversion.price,
  //         quote: quoteConversion.quote
  //       }
  //       profitConverted = {
  //         value: profit * quoteConversion.price,
  //         quote: quoteConversion.quote
  //       }
  //     }
  //     else {
  //       // @todo implement or else we should check if the quote is convertible from currency conversion
  //     }

  //     /* Aggregators */
  //     if (!external && !session.virtual) {
  //       this.profitAggregator.pushUnit(session.quote, profit)
  //       const totalObject = totalConverted || total;
  //       this.totalValueAggregator.pushUnit(totalObject.quote, totalObject.value)
  //       this.walletAggregator.pushUnit(session.symbol, summary.volume)
  //     }
  //   }

  //   viewOptions = Object.assign({}, window.options.sessionViewOptions, viewOptions)

  //   return html`
  //   <div class="session"
  //       ?entitled="${session.title}"
  //       ?external="${external}"
  //       ?eventful="${viewOptions.events}"
  //       ?virtual="${session.virtual}"
  //       @mousedown="${(e) => viewOptions.events && this.onSessionElementClick(e, session)}">

  //     <!-- TITLE -->
  //     ${ session.title ? html`
  //     <div class="title">${session.title}</div>
  //     ` : nothing }

  //     <div>
  //       <div class="name">${session.symbol}<mwc-icon>sync_alt</mwc-icon>${session.quote}</div>
  //       ${viewOptions.showPrice ? html`<div class="price">${price}</div>` : nothing }
  //     </div>

  //     <!-- middle part -->
  //     <div style="display:flex;flex-direction:column;align-items:${viewOptions.showPercent ? 'center' : 'flex-end' };flex:1">

  //       <!-- GAIN -->
  //       <div style="display:flex;align-items:center;${viewOptions.showTotalValue ? 'margin-bottom:5px' : ''}">
  //         ${viewOptions.showSourceProfit || !profitConverted ? html`
  //         <div>${outputPriceTemplate(profit, session.quote)}</div>
  //         ` : nothing }
  //         ${profitConverted ? html`
  //         <div style="display:flex;align-items:center;margin-left:4px;">
  //           ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">(</span>` : nothing }
  //           ${outputPriceTemplate(profitConverted.value, profitConverted.quote)}
  //           ${viewOptions.showSourceProfit ? html`<span style="color:#00000033">)</span>` : nothing }
  //         </div>
  //         ` : nothing}
  //       </div>

  //       <!-- TOTAL VALUE -->
  //       ${viewOptions.showTotalValue ? html`
  //         <div class="total-value">
  //           <span>${formatOutputPrice(total.value, total.quote)}</span>
  //           ${total.quote !== window.spacesManager.space.currency && totalConverted !== undefined ? html`
  //           <span>(${formatOutputPrice(totalConverted.value, totalConverted.quote)})</span>
  //           ` : nothing}
  //         </div>
  //       ` : nothing }
  //     </div>

  //     <!-- PERCENT -->
  //       ${viewOptions.showPercent ? html`
  //       <!-- <div style="width:100px;overflow:hidden;overflow-x:auto;"> -->
  //         <span class="percent"
  //           style="background-color:${!percent ? 'grey' : percent > 0 ? 'var(--green)' : 'red'}">${round(percent, 2) || '0'}%</span>
  //       <!-- </div> -->
  //       ` : nothing }

  //     ${viewOptions.showCross ? html`
  //       <mwc-icon-button icon="close"
  //         style="color:#bdbdbd"
  //         @mousedown="${e => e.stopPropagation()}"
  //         @click="${() => viewOptions.events && window.sessionsInterface.deleteSession(session)}"></mwc-icon-button>
  //     ` : nothing }
  //   </div>
  //   <style>
  //     [hide] {
  //       display:none;
  //     }
  //   </style>
  //   `
  // }

  // sessionExternalTemplate(session: TradeSession, viewOptions?: Partial<SessionViewOptions>) {
  //   return this.sessionTemplate(session, true, viewOptions)
  // }

  // private onSessionElementClick(e: PointerEvent, session: TradeSession) {
  //   if (e.button === 2) {
  //     openCryptowatchLink(session)
  //   }
  //   else {
  //     window.tradesInterface.openSession(session)
  //   }
  // }

  getStripFromSessionElement (session: TradeSession) {
    return [...this.stripElements].find(el => el.session === session)
  }

  openPreSessionMenu (session: TradeSession) {
    const summary = getSummary(session)

    const priceIntervalFct = () => {
      const sessionSummary = getSessionSummary(session)
      this.dialog.heading = `${session.symbol} (${sessionSummary.price} ${session.quote})`
    }
    priceIntervalFct()
    const priceInterval = setInterval(priceIntervalFct, 1000)

    render(html`
    <style>
      /* mwc-dialog > mwc-button:not([slot=primaryAction]) {
        margin: 7px 0;
      } */
      #pre-menu > mwc-button {
        --mdc-theme-primary: var(--main-text-color);
        margin: 7px 0;
      }
    </style>
    <div id="pre-menu">
    <div>volume: ${summary.volume}</div>
    <div>invested: ${formatOutputPrice(summary.invested, session.quote)}</div>
    <div style="display:flex;justify-content:space-evenly;margin: 18px 0">
      <mwc-button style="--mdc-theme-primary:#4caf50" dialogAction="close" raised
        @click="${() => window.tradeCreateDialog.open(session, 'buy')}">buy</mwc-button>
      <mwc-button style="--mdc-theme-primary:#f44336" dialogAction="close" raised
        @click="${() => window.tradeCreateDialog.open(session, 'sell')}">sell</mwc-button>
    </div>
    <mwc-button icon="history" @click="${() => window.tradesInterface.openSession(session)}" dialogAction="close">Trade history</mwc-button><br>
    <mwc-button icon="timeline" @click="${() => openChart(session)}">See chart</mwc-button><br>
    <mwc-button icon="edit" dialogAction="close"
      @click="${() => this.changeSessionTitle(session)}">Change title</mwc-button><br>
    <mwc-button icon="title" dialogAction="close">t-code</mwc-button><br>
    <mwc-button style="--mdc-theme-primary:red" icon="delete" dialogAction="close"
      @click="${() => window.sessionsInterface.deleteSession(session)}">Delete session</mwc-button><br>
    <mwc-button icon="notifications" dialogAction="close"
      @click=${() => window.sessionAlert.open(this.getStripFromSessionElement(session)!)}>alert</mwc-button><br>

    <div style="display:flex;align-items:center">
      <mwc-formfield label="Virtual">
        <mwc-checkbox .checked="${live(session?.virtual)}"
          @change="${(e) => {
            session!.virtual = e.target.checked;
            window.sessionsInterface.requestUpdate();
            window.spacesManager.save()
          }}"></mwc-checkbox>
      </mwc-formfield>
      <mwc-icon style="cursor:pointer;margin-left:10px;vertical-align:center;--mdc-icon-size:18px" @click="${openVirtualInfoDialog}">help_outline</mwc-icon>
    </div>
    </div>

    <mwc-button slot="primaryAction" dialogAction="close">cancel</mwc-button>
    `, this.dialog)
    this.dialog.open = true

    const closedEvent = () => {
      clearInterval(priceInterval)
      this.dialog.removeEventListener('closed', closedEvent)
    }
    this.dialog.addEventListener('closed', closedEvent);
  }

  private changeSessionTitle (session: TradeSession) {
    const placeholder = session.title || '';
    const title = prompt('title', placeholder)
    if (title !== null) {
      session.title = title;
    }
    // else cancelled

    this.requestUpdate()
    window.app.spacesManager.save()
  }
}

declare global {
  interface Window {
    sessionsView: SessionsView;
  }
}