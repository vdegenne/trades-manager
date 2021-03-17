import { css, customElement, html, LitElement, property, query } from "lit-element";
import '@material/mwc-dialog'
import '@material/mwc-button'
import { Trade, TradeManager, TradeSession} from "./trades";
import { Dialog } from "@material/mwc-dialog";
import '@material/mwc-select'
import '@material/mwc-radio'
import '@material/mwc-formfield'
import '@material/mwc-textfield'
import '@material/mwc-tab-bar'
import { Radio } from "@material/mwc-radio";
import { TradesView } from "./trades-view";
import { nothing } from "lit-html";
import { CoingeckoPairsManager } from "./coingecko/CoingeckoManager";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { sortAlphabetically } from "./util";

type formData = {
  symbol: string;
  currency: string;
  price: string;
  volume: string;
  type: 'buy'|'sell';
}

const formTypes = ['form', 'text'] as const

@customElement('trades-interface')
export class TradesInterface extends LitElement {
  public tradesManager: TradeManager

  @property()
  private updating = false

  @property()
  private formType: 'form'|'text' = 'form';

  @property()
  private session?: TradeSession;
  @property()
  private trade?: Trade;

  @property()
  private exchange?: AvailableExchanges;
  @property()
  private symbol?: string;
  @property()
  private quote?: string;



  @property()
  asset?: string;

  private tradesView: TradesView;

  @query('mwc-dialog[heading=Transaction]') transactionDialog!: Dialog;

  constructor() {
    super()

    // creating the trade manager with local data if any
    this.tradesManager = new TradeManager(
      localStorage.getItem('trades') ? JSON.parse(localStorage.getItem('trades')!) : []
    );

    // then here we should update the different pairs manager
    ExchangesManager.initializeExchangesFromSessions(this.tradesManager.sessions)

    // start the loops to fetch the prices
    // ExchangesManager.startUpdateRoutines()

    // trades view
    this.tradesView = new TradesView(this)
  }

  static styles = css`
  p {
    margin: 20px 0 4px 0;
  }

  .form-content {
    height: 0;
    overflow: hidden;
  }

  [show] {
    height: initial;
    overflow: visible;
  }

  mwc-tab[active] {
    background-color: #eeeeee;
  }

  select {
    width: 100%;
    padding: 10px;
  }

  sup {
    color: red;
  }
  `

  render () {
    this.tradesView.requestUpdate()

    console.log('god damn')

    const exchanges = ExchangesManager.getAvailableExchanges()
    let symbols;
    let quotes;
    if (this.exchange) {
      symbols = sortAlphabetically(ExchangesManager.getAvailableSymbols(this.exchange))
      if (this.symbol) {
        quotes = sortAlphabetically(ExchangesManager.getAvailableQuotesFromSymbol(this.exchange, this.symbol))
      }
    }

    return html`
    <div style="text-align:center">
      ${!this.tradesManager.sessions.length ? html`<div style="font-size:18px;margin:18px 0">no trades yet</div>` : nothing}
      ${this.tradesView}
      <mwc-button 
        style="margin-top:20px"
        @click="${() => this.openTransactionDialog()}" raised icon="add">add</mwc-button>
    </div>


    <mwc-dialog id="trade" heading="Trade"
        @opened="${this.fixOverflow}" open>
      <form>
        <div style="width:650px"></div>
        <mwc-tab-bar
            @MDCTabBar:activated="${e => this.formType = formTypes[e.detail.index]}">
          <mwc-tab label="form"></mwc-tab>
          <mwc-tab label="text"></mwc-tab>
        </mwc-tab-bar>


        <div class="form-content" ?show="${this.formType === 'form'}">
          <p>Exchange<sup>*</sup></p>
          <select name="exchange" @change="${e => this.onExchangeChange(e.target.value)}" required
              ?disabled="${this.updating}">
            <option></option>
            ${exchanges.map(exchange => html`
            <option value="${exchange}">${exchange}</option>
            `)}
          </select>

          <p>Symbol<sup>*</sup></p>
          <select name="symbol" @change="${e => this.onSymbolChange(e.target.value)}" required
              ?value="${this.symbol}"
              ?disabled="${!symbols || this.updating}">
            <option></option>
            ${symbols ? symbols.map(symbol => {
              return html`<option value="${symbol}">${symbol}</option>`
            }) : nothing}
          </select>

          <p>Quote<sup>*</sup></p>
          <select name="quote" @change="${e => this.onQuoteChange(e.target.value)}" required
              ?disabled="${!quotes || this.updating}">
            <option></option>
            ${quotes ? quotes.map(quote => {
              return html`<option value="${quote}">${quote}</option>`
            }) : nothing}
          </select>

          <p>Type</p>
          <mwc-formfield label="buy" style="--mdc-theme-text-primary-on-background:green">
            <mwc-radio name="type" value="buy" checked></mwc-radio>
          </mwc-formfield>
          <mwc-formfield label="sell" style="--mdc-theme-text-primary-on-background:red">
            <mwc-radio name="type" value="sell"
              ?disabled="${!this.updating}"></mwc-radio>
          </mwc-formfield>

          <p>Price<sup>*</sup></p>
          <mwc-textfield outlined required
            validationMessage="required"
            type="number"
            name="price"></mwc-textfield>

          <p>Volume<sup>*</sup></p>
          <mwc-textfield outlined required
            validationMessage="required"
            type="number"
            name="volume"></mwc-textfield>

          <p>Fees</p>
          <mwc-textfield outlined
            type="number"
            name="fees"></mwc-textfield>
        </div>

        <div class="form-content" ?show="${this.formType === 'text'}">
          <p>Input</p>
          <mwc-textfield outlined style="width:100%" required></mwc-textfield>
          <p>Examples :<br>
          ETH-EUR:b:1440:1<br>
          means "(b)uying 1 ETH at 1440EUR"</p>
        </div>
      </form>

      <mwc-button outlined slot="secondaryAction"
        @click="${this.reset}">reset</mwc-button>
      <mwc-button unelevated slot="secondaryAction"
        @click="${this.submit}">trade</mwc-button>
      <mwc-button slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>`
  }
  
  fixOverflow() {
    this.transactionDialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__surface')!.style.overflowY = 'visible'
    this.transactionDialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__content')!.style.overflow = 'visible'
  }

  onExchangeChange (value) {
    this.exchange = value;
    this.symbol = undefined
    this.names['symbol'].value = ''
  }
  onSymbolChange (value) {
    this.symbol = value;
    this.names['quote'].value = ''
  }
  onQuoteChange (value) {
    this.quote = value
  }

  async setSession (session: TradeSession) {
    const names = this.names;
    names['exchange'].value = session.exchange
    this.exchange = session.exchange
    await this.updateComplete
    names['symbol'].value = session.symbol
    this.symbol = session.symbol
    await this.updateComplete
    names['quote'].value = session.quote
    this.quote = session.quote
    this.session = session;
    this.updating = true;
  }

  getType () {
    return this.shadowRoot!.querySelector<Radio>('[name=type][checked]')!.value;
  }

  // onAssetSelection (e) {
  //   try {
  //     this.getEl('price').setCustomValidity('')
  //     const symbol = this.getEl('symbol').value;
  //     const currency = this.getEl('symbol').value;
  //     if (symbol && currency) {
  //       const pair = this.coingeckoManager.getPair(`${symbol}-${currency}`)
  //       if (pair) {
  //         this.getEl('price').value = pair.price!.toString();
  //       }
  //     }
  //     this.updateFormCoherence()
  //   } catch (e) {
  //     // console.log(e)
  //   }
  // }
  
  // async updateFormCoherence () {
  //   const symbol = this.getEl('symbol').value;
  //   const currency = this.getEl('symbol').value;
  //   if (symbol && currency) {
  //     const summary = this.tradesManager.getSummarizedTrade(`${symbol}-${currency}`)
  //     this.shadowRoot!.querySelector<Radio>('[name=type][value=sell]')!.disabled = !summary || summary.volume === 0;
  //     if (!summary) {
  //       this.shadowRoot!.querySelector<Radio>('[name=type][value=buy]')!.checked = true;
  //     }
  //     else {
  //       await new Promise(resolve => setTimeout(resolve, 200))
  //       if (this.getType() === 'sell') {
  //         this.getEl('volume').value = summary.volume.toString();
  //       }
  //     }
  //   }
  // }

  deleteAsset (assetName: string) {
    const accept = window.confirm('Are you sure ?')
    if (accept) {
      this.trades.deleteAsset(assetName)
      this.requestUpdate()
      window.app.toast('asset deleted')
      this.saveTrades()
    }
  }

  get names (): {[elName: string]: HTMLInputElement} {
    const els = [...this.shadowRoot!.querySelectorAll<HTMLInputElement>(`[name]`)].filter(el => {
      return !(el instanceof Radio) || el.checked;
    })
    return Object.fromEntries(els.map(el => ([el.getAttribute('name'), el])));
  }

  // getFormElements () {
  //   return [...this.shadowRoot!.querySelectorAll('[name]')].filter(el => {
  //     return (!(el instanceof Radio) || el.checked)
  //   }) as HTMLInputElement[]
  // }

  submit () {
    const names = this.names;
    // const formElements = Object.values(names)

    for (const [elName, el] of Object.entries(names)) {
      if (elName === 'type') continue;

      if (!el.checkValidity()) {
        el.reportValidity()
        return
      }
    }
    // for (const el of formElements) {
    //   if (el instanceof Radio) continue

    //   if (el.getAttribute('name') === 'volume' || el.getAttribute('name') === 'price') {
    //     el.setCustomValidity('')
    //     el.reportValidity()

    //     if (isNaN(parseFloat(el.value))) {
    //       el.setCustomValidity('invalid value')
    //       el.reportValidity()
    //       return;
    //     }
    //   }

    //   if (!el.checkValidity()) {
    //     el.reportValidity()
    //     return;
    //   }
    // }

    const transac: formData = Object.fromEntries(formElements.map(el => {
      return [el.getAttribute('name'), el.value]
    }))

    // we make sure we can't sell more than we have
    if (this.getType() === 'sell') {
      const summary = this.tradesManager.getSummarizedTrade(`${transac.symbol}-${transac.currency}`)
      if (parseFloat(transac.volume) > summary!.volume) {
        window.app.toast('not enough volume !')
        this.getEl('volume').setCustomValidity(`not enought volume (max: ${summary!.volume})`)
        this.getEl('volume').reportValidity()
        return;
      }
    }

    // we insert the new pair in the gecko manager before adding the trade
    this.coingeckoManager.addPair(transac.symbol, transac.currency)
    
    this.tradesManager.addTrade(`${transac.symbol}-${transac.currency}`, {
      type: transac.type,
      price: parseFloat(transac.price),
      volume: parseFloat(transac.volume)
    })

    // this.transactionDialog.close()
    this.reset()
    window.app.toast('trade added')
    this.requestUpdate()
    this.transactionDialog.close()
    this.saveTrades()
  }

  saveTrades () {
    localStorage.setItem('trades', this.tradesManager.toString())
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
    if (!this.session) {
      this.onSymbolChange(undefined)
      this.onExchangeChange(undefined)
    }
    const names = this.names;
    names['price'].value = ''
    names['volume'].value = ''
    names['fees'].value = ''
  }

  hardReset () {
    this.session = undefined
    this.reset()
  }
}