import { getSessionSummary, getSummary, Trade, TradeSession } from "./TradesManager";
import { css, html, LitElement, nothing } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import { Dialog } from "@material/mwc-dialog";
import { firstLetterUpperCase, openVirtualInfoDialog, outputPriceTemplate } from "./util";
import './session-create-dialog'
import './trade-create-dialog'
import { ExchangesManager } from './ExchangesManager';
import { timeAgo } from './time-ago';


@customElement('trades-interface')
export class TradesInterface extends LitElement {
  @state()
  private session?: TradeSession;

  @query('mwc-dialog') dialog!: Dialog;

  static styles = css`
  `

  constructor() {
    super()
    window.tradesInterface = this
  }

  render() {
    if (this.session === undefined) return nothing;

    const trades = this.session.trades.slice().reverse()
    const lastTrade = trades[0];
    // const oldestTrade = this.session?.trades.length && this.session.trades[0];
    const summary = getSessionSummary(this.session)
    const profit = { value: summary.profit!, symbol: this.session.quote }
    const conversion = ExchangesManager.getConversionPrice(this.session.quote, window.spacesManager.space.currency, this.session.exchange)
    if (conversion) {
      profit.value = profit.value * conversion.value
      profit.symbol = conversion.quote
    }

    return html`
    <mwc-dialog heading="${this.session.symbol}/${this.session.quote} (${firstLetterUpperCase(this.session?.exchange)})">
      <div style="width:600px"></div>
      <div>
        <div style="text-align:right">${lastTrade && lastTrade.date ? `last trade : ${timeAgo.format(lastTrade.date)}` : ''}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center">
            <!-- <mwc-formfield label="Virtual">
              <mwc-checkbox ?checked="${this.session?.virtual}"
                @change="${(e) => this.onVirtualChange(e)}"></mwc-checkbox>
            </mwc-formfield> -->
          </div>
        </div>
        <div style="max-height: 500px;overflow: auto;">
        ${this.session ? html`
          ${trades!.length
            ? trades!.map(trade => this.tradeTemplate(trade, this.session!))
            : html`<div style="margin:38px;text-align:center">no trades</div>`
          }
        ` : nothing}
        </div>

        <div style="padding: 7px 12px;color:var(--main-text-color);border-radius: 0 0 5px 5px;">
          <span>Total Volume : </span><span style="font-weight:500">${summary?.volume}</span><br>
          <span>Profit : </span><span>${outputPriceTemplate(profit.value, profit.symbol)}</span>
        </div>
      </div>

      <!-- trades actions -->
      <div style="display:flex;justify-content:flex-end">
        <a href="#" @click="${() => this.deleteAllTrades(this.session!)}">delete all trades</a>
      </div>
      <div>
        <!-- <mwc-button outlined icon="show_charts"
          @click="${() => window.tradeCreateDialog.open(this.session!)}">trade</mwc-button> -->
        <!-- <mwc-button outlined icon="title"
          @click="${(e) => window.tcodeInterface.open(this.session)}">tcode</mwc-button> -->
      </div>

      <mwc-button unelevated slot="secondaryAction"
        @click=${() => {this.dialog.close(); window.sessionsView.openPreSessionMenu(this.session!)}}><mwc-icon>arrow_back</mwc-icon></mwc-button>
      <mwc-button unelevated slot="secondaryAction" style="--mdc-theme-primary:#4caf50"
        @click="${() => window.tradeCreateDialog.open(this.session!, 'buy')}">buy</mwc-button>
      <mwc-button unelevated slot="secondaryAction" style="--mdc-theme-primary:#f44336"
        @click="${() => window.tradeCreateDialog.open(this.session!, 'sell')}">sell</mwc-button>
      <!-- <mwc-button unelevated slot="secondaryAction" icon="copy_all"
        @click="${() => this.oncloneSessionClick()}">clone</mwc-button> -->
      <!-- <mwc-button unelevated slot="secondaryAction" style="--mdc-theme-primary:#f44336" icon="delete"
        @click="${() => window.sessionsInterface.deleteSession(this.session!)}">delete</mwc-button> -->
      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  tradeTemplate (trade: Trade, session: TradeSession, eventful = true) {
    // console.log(trade.date!)
    return html`
    <div class="trade" @click=${() => trade.date && window.app.toast(timeAgo.format(trade.date!).toString())}>
      <b style="color:${trade.type === 'buy' ? 'green' : 'red'}">${trade.type.toUpperCase()}</b>
      <div><span>${trade.price} ${session.quote}</span> <b style="position:relative;top:-1px;color:#bdbdbd">@</b> <span>${trade.volume}</span></div>
      ${eventful ? html`
        <mwc-icon-button icon="close"
          @click="${() => this.deleteTrade(trade)}"></mwc-icon-button>
      ` : nothing}
    </div>
    <style>
      .trade {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--on-background-color);
        padding: 6px 6px 6px 12px;
        cursor: pointer;
        margin: 4px 0;
      }
      .trade > mwc-icon-button {
        --mdc-icon-size: 20px;
        --mdc-icon-button-size: 32px;
      }
    </style>
    `
  }

  private async oncloneSessionClick () {
    // the session interface clone session function ask for confirmation before cloning the object
    // we make sure we catch the error in case the user cancel the operation.
    try {
      await window.sessionsInterface.cloneSession(this.session!)
    } catch (e) { return /* canceled */ }

    this.dialog.close()
  }

  private onVirtualChange(e) {
    this.session!.virtual = e.target.checked;
    this.requestUpdate()
    window.sessionsInterface.requestUpdate();
    window.spacesManager.save()
  }

  public async openSession (session: TradeSession) {
    this.session = session
    await this.updateComplete
    this.dialog.show();
  }

  async deleteTrade (trade: Trade) {
    try {
      await window.confirmDialog.open('Deleting Trade', html`
        You are about to delete this trade :
        <div style="margin:12px 0">
          ${this.tradeTemplate(trade, this.session!, false)}
        </div>
        Are you sure to continue ?
      `)
    } catch (e) {
      return; // canceled
    }

    window.tradesManager.deleteTrade(trade)
    window.app.toast('trade deleted')
    this.requestUpdate()
    window.sessionsInterface.requestUpdate()
    window.spacesManager.save()
  }

  async deleteAllTrades (session: TradeSession) {
    try {
      await window.confirmDialog.open('Delete trades', html`
        Are you sure to delete all trades in this session ?
      `)
    } catch (e) {
      return; // cancelled
    }

    window.tradesManager.deleteAllTrades(session)
    this.requestUpdate()
    window.sessionsInterface.requestUpdate()
    window.spacesManager.save()
  }

  /**
   * This function throws an error on cancel, make sure you catch the error in scripts calling it.
   */
  async addTrade (session: TradeSession, trade: Trade) {
    const summary = getSummary(session)
    if (trade.type === 'sell' && summary.volume && trade.volume > summary.volume) {
      await window.confirmDialog.open('Selling more than you have', html`
      <p>You are about to sell more volume than you have registered in this pair (from <b>BUY</b> order).</p>

      <p>If you continue, your session will show inconsistent values.<br>
      A good practice is to always sell what you have, or delete a session if it shows negative values or else the totals will also have bad results.</p>
      `)
    }

    window.tradesManager.addTrade(session, trade)
    // window.tradesInterface.dialog.show()
    this.openSession(session)
    // window.sessionsView.dialog.close()
    // window.app.toast('trade registered')
    this.requestUpdate()
    window.sessionsInterface.requestUpdate()
    window.spacesManager.save()
  }



  public show() {
    this.dialog.show()
  }
}

declare global {
  interface Window {
    tradesInterface: TradesInterface
  }
}