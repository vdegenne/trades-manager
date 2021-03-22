import { Dialog } from "@material/mwc-dialog";
import { TextField } from "@material/mwc-textfield";
import { css, customElement, html, LitElement, property, query } from "lit-element";
import { ExchangesManager } from "./ExchangesManager";
import { getSummary, summarizeSessionTrades, TradeSession } from "./trades";

declare global {
  interface Window {
    tradeCreateDialog: TradeCreateDialog;
  }
}

@customElement('trade-create-dialog')
export class TradeCreateDialog extends LitElement {
  @property()
  private session!: TradeSession;

  @property()
  private type: 'buy'|'sell' = 'buy';

  @property()
  private price = '';
  @property()
  private quantity = '';
  @property()
  private maxQuantity?: number;
  @property()
  private fees = '';

  @query('#price') priceField!: TextField;
  @query('#quantity') quantityField!: TextField;
  @query('#fees') feesField!: TextField;

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
    if (this.session) {
      const summary = getSummary(this.session)
      this.maxQuantity = summary.volume
    }
    return html`
    <mwc-dialog heading="Add Trade">
      <div style="width:500px;"></div>
      <form>
        <mwc-tab-bar activeIndex="${this.type === 'buy' ? 0 : 1}"
          @MDCTabBar:activated="${(e) => this.type = e.detail.index === 0 ? 'buy' : 'sell'}">
          <mwc-tab label="buy" style="--mdc-tab-text-label-color-default:green;--mdc-theme-primary:green"></mwc-tab>
          <mwc-tab label="sell" style="--mdc-tab-text-label-color-default:red;--mdc-theme-primary:red"></mwc-tab>
        </mwc-tab-bar>

        <p>Price</p>
        <div class="field-and-button">
          <mwc-textfield id="price" outlined type="number"
            min="0"
            @mousewheel="${(e) => this.price = e.target.value}"
            @keyup="${(e) => e.target.step = this.getStep(e.target.value)}"></mwc-textfield>
          <mwc-button outlined
            @click="${() => this.insertLastPrice()}">last price</mwc-button>
        </div>

        <p>Quantity</p>
        <div class="field-and-button">
          <mwc-textfield id="quantity" outlined type="number"
            min="0"
            @mousewheel="${(e) => this.quantity = e.target.value}"
            @keyup="${(e) => e.target.step = this.getStep(e.target.value)}"></mwc-textfield>
          <mwc-button outlined
            ?disabled="${this.type === 'buy' || this.session && !this.maxQuantity}"
            @click="${() => this.insertAvailableVolume()}">available</mwc-button>
        </div>

        <p>Fees</p>
        <mwc-textfield id="fees" outlined type="number" min="0"></mwc-textfield>
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
    this.priceField.value = this.price = price ? price.toString() : '';
    this.priceField.step = this.getStep(this.priceField.value)
  }

  private async insertAvailableVolume () {
    this.quantityField.value = this.quantity = this.maxQuantity!.toString();
    this.quantityField.step = this.getStep(this.quantityField.value)
  }

  private async onAddButtonClick() {
    if (!this.priceField.value || !this.priceField.value) {
      return;
    }
    const quantity = parseFloat(this.quantityField.value)
    if (this.type === 'sell' && this.maxQuantity && quantity > this.maxQuantity) {
      try {
        await window.app.confirmDialog.open('Selling more than you have', html`
        <p>You are about to sell more volume than you have registered in this pair (from <b>BUY</b> order).</p>

        <p>If you continue, your session will show inconsistent values.<br>
        A good practice is to always sell what you have, or delete a session if it shows negative values or else the totals will also have bad results.</p>
        `)
      } catch (e) {
        return; // canceled
      }
    }

    // add the new trade into the session
    window.tradesInterface.addTrade(this.session, {
      type: this.type,
      price: parseFloat(this.priceField.value),
      volume: quantity,
      fees: parseFloat(this.feesField.value) || 0
    })
    this.dialog.close()
    this.reset()
  }

  open(session: TradeSession) {
    if (session !== this.session) {
      this.reset()
    }
    this.session = session;
    this.dialog.show()
  }
  
  private reset() {
    this.type = 'buy'
    this.price = '';
    this.priceField.value = ''
    this.quantity = '';
    this.quantityField.value = ''
    this.fees = '';
    this.feesField.value = '';
  }
}