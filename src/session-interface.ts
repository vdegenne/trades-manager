import { css, customElement, html, LitElement, property, query } from "lit-element";
import { getSummary, Trade, TradeSession } from "./trades";
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import { Dialog } from "@material/mwc-dialog";
import { nothing } from "lit-html";
import { firstLetterUpperCase, sortAlphabetically } from "./util";
import './session-create-dialog'
import { SessionCreateDialog } from "./session-create-dialog";
import './trade-create-dialog'
import { TradeCreateDialog } from "./trade-create-dialog";

declare global {
  interface Window {
    sessionInterface: SessionInterface
  }
}

@customElement('session-interface')
export class SessionInterface extends LitElement {
  @property()
  private session?: TradeSession;

  @query('mwc-dialog') dialog!: Dialog;
  @query('session-create-dialog') createDialog!: SessionCreateDialog;
  @query('trade-create-dialog') createTradeDialog!: TradeCreateDialog;

  static styles = css`
  `

  constructor() {
    super()
    window.sessionInterface = this
  }

  render() {
    const trades = this.session?.trades.slice().reverse()

    return html`
    <mwc-dialog heading="Session (${this.session?.symbol} on ${firstLetterUpperCase(this.session?.exchange)})"
        escapeKeyAction="">
      <div style="width:600px"></div>
      <div>
        <div style="max-height: 500px;overflow: auto;">
        ${this.session ? html`
          ${trades!.length
            ? trades!.map(trade => this.tradeTemplate(trade, this.session!))
            : html`<div style="margin:38px;text-align:center">no trades</div>`
          }
        ` : nothing}
        </div>

        <div style="padding: 7px 12px;background: #e0e0e0;color: #212121;border-radius: 0 0 5px 5px;">
          <span>Total Volume : </span><span style="font-weight:500">${this.session ? getSummary(this.session).volume : ''}</span></div>
      </div>

      <mwc-button unelevated slot="secondaryAction" icon="show_charts"
          @click="${() => window.tradeCreateDialog.open(this.session!)}">add trade</mwc-button>
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

  openSession (session: TradeSession) {
    this.session = session
    this.dialog.show();
  }

  async deleteTrade (trade: Trade) {
    try {
      await window.app.confirmDialog.open('Deleting Trade', html`
        You are about to delete this trade :
        <div style="margin:12px 0">
          ${this.tradeTemplate(trade, this.session!, false)}
        </div>
        Are you sure to continue ?
      `)
    } catch (e) {
      return; // canceled
    }

    window.tradesInterface.deleteTrade(this.session!, trade)
    window.app.toast('trade deleted')
    window.tradesInterface.requestUpdate()
    this.requestUpdate()
  }
}