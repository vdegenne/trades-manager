import { css, customElement, html, LitElement, property, query } from "lit-element";
import '@material/mwc-dialog'
import '@material/mwc-button'
import { TradeManager, Trades } from "./trades";
import { Dialog } from "@material/mwc-dialog";
import '@material/mwc-select'
import '@material/mwc-radio'
import '@material/mwc-formfield'
import '@material/mwc-textfield'
import { Radio } from "@material/mwc-radio";
import {round} from './util'
import { TradesView } from "./trades-view";
import { nothing } from "lit-html";
import { HighlightSpanKind } from "typescript";

type formData = {
  asset: string;
  price: string;
  volume: string;
  type: 'buy'|'sell';
}

@customElement('trades-interface')
export class TradesInterface extends LitElement {
  @property({type:Object})
  trades: TradeManager

  @property()
  asset?: string;

  private tradesView: TradesView;

  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-dialog[heading=Transaction]') transactionDialog!: Dialog;

  constructor() {
    super()

    this.trades = new TradeManager(
      localStorage.getItem('trades') ? JSON.parse(localStorage.getItem('trades')!) : {}
    );

    this.tradesView = new TradesView(this.trades)
  }

  static styles = css`
  p {
    margin: 20px 0 4px 0;
  }
  `

  render () {
    this.tradesView.requestUpdate()

    return html`
    <div style="text-align:center">
      ${!this.trades.assets.length ? html`<div style="font-size:18px;margin:18px 0">no trades yet</div>` : nothing}
      ${this.tradesView}
      <mwc-button 
        style="margin-top:20px"
        @click="${() => this.openTransactionDialog()}" raised icon="add">add</mwc-button>
    </div>



    <mwc-dialog id="transaction" heading="Transaction"
        @opened="${this.fixOverflow}">
      <form>
        <div style="width:350px"></div>
        <p>Asset</p>
        <mwc-select name="asset" style="width:100%" required
            fixedMenuPosition
            @selected="${(e) => this.onAssetSelection(e)}">
          <mwc-list-item></mwc-list-item>
          ${window.app.cryptos.map(crypto => {
            return html`<mwc-list-item
              ?selected="${crypto.name === this.asset}"
              value="${crypto.name}">${crypto.name}</mwc-list-item>`
          })}
        </mwc-select>

        <p>Type</p>
        <mwc-formfield label="buy" style="--mdc-theme-text-primary-on-background:green">
          <mwc-radio name="type" value="buy" checked></mwc-radio>
        </mwc-formfield>
        <mwc-formfield label="sell" style="--mdc-theme-text-primary-on-background:red"
            @click="${this.updateFormCoherence}">
          <mwc-radio name="type" value="sell"></mwc-radio>
        </mwc-formfield>

        <p>Price</p>
        <mwc-textfield outlined required
          name="price"></mwc-textfield>

        <p>Volume</p>
        <mwc-textfield outlined required
          name="volume"></mwc-textfield>
      </form>

      <mwc-button unelevated slot="secondaryAction"
        @click="${this.submit}">trade</mwc-button>
      <mwc-button slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>`
  }
  
  fixOverflow() {
    this.transactionDialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__surface')!.style.overflowY = 'visible'
    this.transactionDialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__content')!.style.overflow = 'visible'
  }

  getType () {
    return this.shadowRoot!.querySelector<Radio>('[name=type][checked]')!.value;
  }

  onAssetSelection (e) {
    try {
      this.getEl('price').setCustomValidity('')
      this.getEl('price').value = window.app.cryptos.find(c => c.name === e.target.value)!.getLastPrice()!.toString()
      this.updateFormCoherence()
    } catch (e) {
      // console.log(e)
    }
  }

  async updateFormCoherence () {
    const summary = this.trades.getSummarizedTrade(this.getEl('asset').value);
    this.shadowRoot!.querySelector<Radio>('[name=type][value=sell]')!.disabled = !summary || summary.volume === 0;
    if (!summary) {
      this.shadowRoot!.querySelector<Radio>('[name=type][value=buy]')!.checked = true;
    }
    else {
      await new Promise(resolve => setTimeout(resolve, 200))
      if (this.getType() === 'sell') {
        this.getEl('volume').value = summary.volume.toString();
      }
    }
  }

  deleteAsset (assetName: string) {
    const accept = window.confirm('Are you sure ?')
    if (accept) {
      this.trades.deleteAsset(assetName)
      this.requestUpdate()
      window.app.toast('asset deleted')
      this.saveTrades()
    }
  }

  getEl (name: string): HTMLInputElement {
    const el = this.shadowRoot!.querySelectorAll<HTMLInputElement>(`[name=${name}]`);
    if (el.length === 1) {
      return el[0]
    }
    // else it's radio
    return [...el].find(el => el.checked)!;
  }

  getFormElements () {
    return [...this.shadowRoot!.querySelectorAll('[name]')].filter(el => {
      return (!(el instanceof Radio) || el.checked)
    }) as HTMLInputElement[]
  }

  submit () {
    const formElements = this.getFormElements()
    for (const el of formElements) {
      if (el instanceof Radio) continue

      if (el.getAttribute('name') === 'volume' || el.getAttribute('name') === 'price') {
        el.setCustomValidity('')
        el.reportValidity()

        if (isNaN(parseFloat(el.value))) {
          el.setCustomValidity('invalid value')
          el.reportValidity()
          return;
        }
      }

      if (!el.checkValidity()) {
        el.reportValidity()
        return;
      }
    }

    const transac: formData = Object.fromEntries(formElements.map(el => {
      return [el.getAttribute('name'), el.value]
    }))

    // we make sure we can't sell more than we have
    if (this.getType() === 'sell') {
      const summary = this.trades.getSummarizedTrade(this.getEl('asset').value)
      if (parseFloat(transac.volume) > summary!.volume) {
        window.app.toast('not enough volume !')
        this.getEl('volume').setCustomValidity(`not enought volume (max: ${summary!.volume})`)
        this.getEl('volume').reportValidity()
        return;
      }
    }
    
    this.trades.addTrade(transac.asset, {
      type: transac.type,
      price: parseFloat(transac.price),
      volume: parseFloat(transac.volume)
    })

    // this.transactionDialog.close()
    this.reset()
    window.app.toast('trade added')
    this.requestUpdate()
    this.transactionDialog.close()
    if (!this.dialog.open) {
      this.show()
    }
    this.saveTrades()
  }

  saveTrades () {
    localStorage.setItem('trades', this.trades.toString())
  }

  show () {
    this.dialog.show()
  }

  openTransactionDialog(asset?: string, price?: number) {
    this.reset()
    if (asset) {
      this.getEl('asset').value = asset
    }
    if (price) {
      this.getEl('price').value = price.toString()
    }
    this.transactionDialog.show()
  }

  reset() {
    for (const el of this.getFormElements()) {
      if (el instanceof Radio) continue;

      el.value = ''
    }
  }
}