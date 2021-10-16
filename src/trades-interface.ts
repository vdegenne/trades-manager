import { css, customElement, html, LitElement, property, query } from "lit-element";
import { getSummary, Trade, TradeSession } from "./TradesManager";
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import { Dialog } from "@material/mwc-dialog";
import { nothing } from "lit-html";
import { firstLetterUpperCase, openVirtualInfoDialog } from "./util";
import './session-create-dialog'
import { SessionCreateDialog } from "./session-create-dialog";
import './trade-create-dialog'
import { TradeCreateDialog } from "./trade-create-dialog";


@customElement('trades-interface')
export class tradesInterface extends LitElement {
  @property()
  private session?: TradeSession;

  @query('mwc-dialog') dialog!: Dialog;
  @query('session-create-dialog') createDialog!: SessionCreateDialog;
  @query('trade-create-dialog') createTradeDialog!: TradeCreateDialog;

  static styles = css`
  `

  constructor() {
    super()
    window.tradesInterface = this
  }

  render() {
    const trades = this.session?.trades.slice().reverse()

    return html`
    <mwc-dialog heading="Session (${this.session?.symbol} on ${firstLetterUpperCase(this.session?.exchange)})"
        escapeKeyAction="">
      <div style="width:600px"></div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;align-items:center">
            <mwc-formfield label="Virtual">
              <mwc-checkbox ?checked="${this.session?.virtual}"
                @change="${(e) => this.onVirtualChange(e)}"></mwc-checkbox>
            </mwc-formfield>
            <mwc-icon style="cursor:pointer;margin-left:10px;vertical-align:center" @click="${openVirtualInfoDialog}">help_outline</mwc-icon>
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

        <div style="padding: 7px 12px;background: #e0e0e0;color: #212121;border-radius: 0 0 5px 5px;">
          <span>Total Volume : </span><span style="font-weight:500">${this.session ? getSummary(this.session).volume : ''}</span>
        </div>
      </div>

      <!-- trades actions -->
      <div style="display:flex;justify-content:flex-end">
        <a href="#" @click="${() => this.deleteAllTrades(this.session!)}">delete all trades</a>
      </div>
      <div>
        <mwc-button outlined icon="notifications"
          @click="${() => window.sessionAlert.open(window.sessionsView.getStripFromSessionElement(this.session!)!)}">alert</mwc-button>
        <!-- <mwc-button outlined icon="show_charts"
          @click="${() => window.tradeCreateDialog.open(this.session!)}">trade</mwc-button> -->
        <!-- <mwc-button outlined icon="title"
          @click="${(e) => window.tcodeInterface.open(this.session)}">tcode</mwc-button> -->
      </div>

      <mwc-button unelevated slot="secondaryAction" icon="copy_all"
        @click="${() => this.oncloneSessionClick()}">clone</mwc-button>
      <!-- <mwc-button unelevated slot="secondaryAction" style="--mdc-theme-primary:#f44336" icon="delete"
        @click="${() => window.sessionsInterface.deleteSession(this.session!)}">delete</mwc-button> -->
      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>

    <session-create-dialog></session-create-dialog>

    <trade-create-dialog></trade-create-dialog>
    `
  }

  tradeTemplate (trade: Trade, session: TradeSession, eventful = true) {
    return html`
    <div class="trade">
      <b style="color:${trade.type === 'buy' ? 'green' : 'red'}">${trade.type.toUpperCase()}</b>
      <div><b>${trade.volume}</b> <b style="position:relative;top:-1px;color:#bdbdbd">@</b> <span>${trade.price} ${session.quote}</span></div>
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
        background-color: #eeeeee;
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

  openSession (session: TradeSession) {
    this.session = session
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
    window.tradesInterface.dialog.close()
    window.sessionsView.dialog.close()
    // window.app.toast('trade registered')
    this.requestUpdate()
    window.sessionsInterface.requestUpdate()
    window.spacesManager.save()
  }
}

declare global {
  interface Window {
    tradesInterface: tradesInterface
  }
}