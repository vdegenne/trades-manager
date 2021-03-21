import { Dialog } from "@material/mwc-dialog";
import { css, customElement, html, LitElement, property, query } from "lit-element";
import { ExchangesManager } from "./ExchangesManager";
import { TradeSession } from "./trades";

declare global {
  interface Window {
    tradeCreateDialog: TradeCreateDialog;
  }
}

@customElement('trade-create-dialog')
export class TradeCreateDialog extends LitElement {
  private session!: TradeSession;

  @property()
  private price = '';
  @property()
  private quantity = '';
  @property()
  private fees = '';

  constructor () {
    super()
    window.tradeCreateDialog = this;
  }

  @query('mwc-dialog') dialog!: Dialog;

  static styles = css`
  mwc-tab[label=buy][active] {
    background-color: #00800022;
  }
  mwc-tab[label=sell][active] {
    background-color: #ff000022;
  }
  form p {
    margin-bottom: 8px
  }
  form mwc-textfield {
    flex: 1;
  }

  .field-and-button {
    display: flex;
    align-items: center;
  }
  .field-and-button > mwc-button {
    --mdc-button-horizontal-padding: 14px;
    margin: 0 0 0 6px;
  }

  mwc-tab-bar {
    --mdc-tab-height: 66px;
  }
  `

  render () {
    return html`
    <mwc-dialog heading="Add Trade">
      <div style="width:500px;"></div>
      <form>
        <mwc-tab-bar>
          <mwc-tab label="buy" style="--mdc-tab-text-label-color-default:green;--mdc-theme-primary:green"></mwc-tab>
          <mwc-tab label="sell" style="--mdc-tab-text-label-color-default:red;--mdc-theme-primary:red"></mwc-tab>
        </mwc-tab-bar>

        <p>Price</p>
        <div class="field-and-button">
          <mwc-textfield outlined type="number"
            value="${this.price}"
            @keyup="${(e) => this.price = e.target.value}"
            step="${this.getStep(this.price)}"
            min="0"></mwc-textfield>
          <mwc-button outlined
            @click="${() => this.insertLastPrice()}">last price</mwc-button>
        </div>

        <p>Quantity</p>
        <mwc-textfield outlined type="number"
          value="${this.quantity}"
          @keyup="${(e) => this.quantity = e.target.value}"
          step="${this.getStep(this.quantity)}"
          min="0"></mwc-textfield>

        <p>Fees</p>
        <mwc-textfield outlined type="number"
          min="0"></mwc-textfield>
      </form>

      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
      <mwc-button unelevated slot="primaryAction" icon="add"
        ?disabled="${!this.price || !this.quantity}"
        @click="${() => this.onAddButtonClick()}">add</mwc-button>
    </mwc-dialog>`
  }
  
  private getStep(value: string): number {
    return 1 / Math.pow(10, value.split('.')[1]?.length ?? 0)
  }

  private async insertLastPrice() {
    // we want the very last price so we should update the pairs to fetch the new data
    await ExchangesManager.exchanges[this.session.exchange].updatePairs()
    const price = ExchangesManager.getPrice(this.session.exchange, this.session.symbol, this.session.quote)
    this.price = price ? price.toString() : '';
  }

  private onAddButtonClick() {

  }

  open(session: TradeSession) {
    if (session !== this.session) {
      this.reset()
    }
    this.session = session;
    this.dialog.show()
  }
  
  private reset() {
    this.price = '';
    this.quantity = '';
    this.fees = '';
  }
}