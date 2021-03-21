import { css, customElement, html, LitElement, property, query } from "lit-element";
import '@material/mwc-dialog'
import '@material/mwc-button'
import { summarizeSessionTrades, Trade, TradeManager, TradeSession} from "./trades";
import { Dialog } from "@material/mwc-dialog";
import '@material/mwc-select'
import '@material/mwc-radio'
import '@material/mwc-formfield'
import '@material/mwc-textfield'
import '@material/mwc-tab-bar'
import { Radio } from "@material/mwc-radio";
import { TradesView } from "./trades-view";
import { nothing } from "lit-html";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { formatQuote, sortAlphabetically } from "./util";
import './session-interface'
import { SessionInterface } from "./session-interface";

type FormData = {
  exchange: AvailableExchanges,
  symbol: string;
  quote: string;
  type: 'buy'|'sell';
  price: string;
  volume: string;
  fees: string;
}

declare global {
  interface Window {
    tradesInterface: TradesInterface;
    sessions: TradeSession[];
  }
}

const formTypes = ['form', 'text'] as const

@customElement('trades-interface')
export class TradesInterface extends LitElement {
  public tradesManager!: TradeManager
  public sessionsInterface: SessionInterface;
  public tradesView: TradesView;

  // @property()
  // private updating = false

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
  private price?: string;
  @property()
  private volume?: string;


  // @property()
  // asset?: string;


  @query('mwc-dialog#trade') tradeDialog!: Dialog;

  constructor() {
    super()

    // we load an empty TradeManager upon startup
    // this.tradesManager = new TradeManager()

    // sessions interface
    this.sessionsInterface = new SessionInterface();

    // trades view
    this.tradesView = new TradesView(this)

    window.tradesInterface = this
    window.sessions = this.sessions
  }

  get sessions () {
    return this.tradesManager?.sessions
  }

  loadSessions (sessions: TradeSession[]) {
    // creating the trade manager with local data if any
    this.tradesManager = new TradeManager(sessions)

    // then here we should update the different pairs manager
    ExchangesManager.initializeExchangesFromSessions(this.tradesManager.sessions)

    // start the loops to fetch the prices
    ExchangesManager.startUpdateRoutines()

    try { // trying to close the session interface dialog
      this.sessionsInterface.dialog.close()
    } catch (e) {}

    this.requestUpdate()
  }


  static styles = css`
  p {
    margin: 20px 0 4px 0;
  }

  .form-content {
    height: 0;
    overflow: hidden;
  }

  [hide] {
    display:none;
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

  #inputs-box {
    text-align: right;
  }
  #inputs-box > mwc-textfield {
    min-width: 232px;
  }
  `

  render () {
    this.tradesView.requestUpdate()

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
    ${this.tradesView}
    <!-- <div>
      ${this.tradesManager ? html`
        ${!this.tradesManager.sessions.length ? html`
        <div style="text-align:center">
          <div style="font-size:24px;margin:38px 0">no sessions yet</div>
          <img src="./images/empty.gif">
        </div>
        ` : nothing}
        <div style="text-align:center">
          <mwc-button 
            style="margin-top:20px"
            @click="${() => this.open()}" raised icon="add">add session</mwc-button>
        </div>
      ` : nothing }
    </div> -->

    ${this.sessionsInterface}

    <mwc-dialog id="trade" heading="${this.session ? 'Add Trade' : 'Create Session'}"
        @opened="${this.fixOverflow}">
      <form>
        <div style="width:650px"></div>
        <!-- <mwc-tab-bar
            @MDCTabBar:activated="${e => this.formType = formTypes[e.detail.index]}">
          <mwc-tab label="form"></mwc-tab>
          <mwc-tab label="text"></mwc-tab>
        </mwc-tab-bar> -->


        <div class="form-content" ?show="${this.formType === 'form'}">
          <p>Exchange<sup>*</sup></p>
          <select name="exchange" @change="${e => this.onExchangeChange(e.target.value)}" required
              ?disabled="${this.session !== undefined}">
            <option></option>
            ${exchanges.map(exchange => html`
            <option value="${exchange}">${exchange}</option>
            `)}
          </select>

          <p>Symbol<sup>*</sup></p>
          <select name="symbol" @change="${e => this.onSymbolChange(e.target.value)}" required
              ?value="${this.symbol}"
              ?disabled="${!symbols || this.session !== undefined}">
            <option></option>
            ${symbols ? symbols.map(symbol => {
              return html`<option value="${symbol}">${symbol}</option>`
            }) : nothing}
          </select>

          <p>Quote<sup>*</sup></p>
          <select name="quote" @change="${e => this.onQuoteChange(e.target.value)}" required
              ?disabled="${!quotes || this.session !== undefined}">
            <option></option>
            ${quotes ? quotes.map(quote => {
              return html`<option value="${quote}">${quote}</option>`
            }) : nothing}
          </select>

          <p>Type</p>
          <mwc-formfield label="buy" style="--mdc-theme-text-primary-on-background:green">
            <mwc-radio name="type" value="buy" checked
              @change="${() => this.requestUpdate()}"
            ></mwc-radio>
          </mwc-formfield>
          <mwc-formfield label="sell" style="--mdc-theme-text-primary-on-background:red">
            <mwc-radio name="type" value="sell"
              @change="${() => this.requestUpdate()}"
              ?disabled="${this.session === undefined || !this.session.trades.length}"></mwc-radio>
          </mwc-formfield>

          <div id="inputs-box" style="text-align:right">
            <p>Price<sup>*</sup></p>
            <mwc-button outlined style="vertical-align:middle;margin-right:12px"
              ?disabled="${this.exchange === undefined || this.symbol === undefined || this.quote === undefined}"
              @click="${this.insertLastPrice}">last price</mwc-button>
            <mwc-textfield outlined required
              @keyup="${e => this.onNumberTypeInputChange('price', e.target.value)}"
              validationMessage="required"
              type="number"
              min="0"
              name="price"></mwc-textfield>

            <p>Volume<sup>*</sup></p>
            <mwc-button outlined style="vertical-align:middle;margin-right:12px"
              ?hide="${!this.session || this.getType() !== 'sell'}"
              @click="${this.insertMaxVolume}">max volume</mwc-button>
            <mwc-textfield outlined required
              @keyup="${e => this.onNumberTypeInputChange('volume', e.target.value)}"
              validationMessage="required"
              type="number"
              min="0"
              max="${this.session && this.getType() === 'sell' ? summarizeSessionTrades(this.session).volume : ''}"
              helper="${this.session && this.getType() === 'sell' ? `Wallet : ${summarizeSessionTrades(this.session).volume} ${this.session.symbol}` : ''}"
              ?helperPersistent="${!!this.session}"
              name="volume"></mwc-textfield>

            <p>Fees</p>
            <mwc-textfield outlined
              @keyup="${e => this.onNumberTypeInputChange('fees', e.target.value)}"
              type="number"
              min="0"
              name="fees"></mwc-textfield>
          </div>
        </div>

        <div class="form-content" ?show="${this.formType === 'text'}">
          <p>Input</p>
          <mwc-textfield outlined style="width:100%" required></mwc-textfield>
          <p>Examples :<br>
          ETH-EUR:b:1440:1<br>
          means "(b)uying 1 ETH at 1440EUR"</p>
        </div>

        <div style="height:50px;"></div>
      </form>

      <mwc-button slot="secondaryAction"
        @click="${this.reset}">reset</mwc-button>
      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        @click="${this.submit}" icon="show_charts">trade</mwc-button>
    </mwc-dialog>
    
    `
  }
  
  fixOverflow() {
    // this.tradeDialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__surface')!.style.overflowY = 'visible'
    // this.tradeDialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__content')!.style.overflow = 'visible'
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

  onNumberTypeInputChange (inputName: string, value: string) {
    // this.price = value

    this.names[inputName].step = (1 / Math.pow(10, value.split('.')[1]?.length ?? 0)).toString()
  }
  // onVolumeChange (value) {
  //   this.price = value

  //   this.names['price'].step = (1 / Math.pow(10, value.split('.')[1]?.length ?? 0)).toString()
  // }

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
    // this.updating = true;
  }

  setTrade (session: TradeSession, trade: Trade) {
    this.session = session
    this.trade = trade
  }

  getType () {
    return this.shadowRoot!.querySelector<Radio>('[name=type][checked]')!.value as 'buy'|'sell';
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

  // deleteAsset (assetName: string) {
  //   const accept = window.confirm('Are you sure ?')
  //   if (accept) {
  //     this.trades.deleteAsset(assetName)
  //     this.requestUpdate()
  //     window.app.toast('asset deleted')
  //     this.saveTrades()
  //   }
  // }

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
    if (this.formType === 'form') {
      if (!this.validateForm()) {
        return;
      }
    }

    else if (this.formType === 'text') {
      if (!this.validateTextForm()) {
        return;
      }
    }

    if (this.formType === 'form') {
      const formData = this.serializeForm() as FormData
      // inserting the new pair in the appropriate exchange
      ExchangesManager.addPair(formData.exchange, formData.symbol, formData.quote)

      // if there is no session we should create it first
      let session = this.session
      if (!session) {
        session = this.tradesManager.createSession(formData.exchange, formData.symbol, formData.quote)
      }
      // then we add the trade
      const { trade } = this.formDataToObjects(formData)
      this.tradesManager.addTrade(session!, trade as Trade)
      window.app.toast(`${!this.session ? 'session and ' : ''}trade created`)
      // we should also update the session interface
      this.sessionsInterface.requestUpdate()
    }

    this.hardReset()
    this.requestUpdate()
    this.tradeDialog.close()
    window.spacesManager.save()
  }

  validateForm () {
    const names = this.names
    for (const [elName, el] of Object.entries(names)) {
      if (elName === 'type') continue;

      if (!el.checkValidity()) {
        el.reportValidity()
        return false
      }
    }

    const formData = this.serializeForm() as FormData

    // we should check if the trade tries to sell more volume than we have
    if (formData.type === 'sell') {
      const summary = this.tradesManager.getSummarizedSessionTrades(this.session!)
      if (parseFloat(formData.volume) > summary.volume) {
        window.app.toast('Too much volume to sell')
        return false
      }
    }

    return true
  }

  validateTextForm () {
    return false
  }

  serializeForm (): Partial<FormData> {
    if (this.formType === 'form') {
      return Object.fromEntries(
        Object.entries(this.names).map(([elName, el]) => [elName, el.value])
      )
    }
    else {
      return {}
    }
  }

  formDataToObjects (formData: Partial<FormData>) {
    const session: Partial<TradeSession> = {}
    const trade: Partial<Trade> = {}

    if (formData.exchange) session.exchange = formData.exchange
    if (formData.symbol) session.symbol = formData.symbol
    if (formData.quote) session.quote = formData.quote
    if (formData.type) trade.type = formData.type
    if (formData.price) trade.price = parseFloat(formData.price)
    if (formData.volume) trade.volume = parseFloat(formData.volume)
    if (formData.fees) trade.volume = parseFloat(formData.fees)

    return { session, trade }
  }

  reset() {
    if (!this.session) {
      this.onQuoteChange(undefined)
      this.onSymbolChange(undefined)
      this.onExchangeChange(undefined)
      this.names['exchange'].value = ''
    }
    const names = this.names;
    names['price'].value = ''
    names['volume'].value = ''
    names['fees'].value = ''
  }

  hardReset () {
    this.session = undefined
    this.trade = undefined
    this.shadowRoot!.querySelector<Radio>('mwc-radio[name=type][value=buy]')!.checked = true;
    this.reset()
  }

  async insertLastPrice () {
    // add pair to make sure the price exists
    await ExchangesManager.addPair(this.exchange!, this.symbol!, this.quote!)
    const price = ExchangesManager.getPrice(this.exchange!, this.symbol!, this.quote!)!.toString()
    this.names['price'].value = price
    this.onNumberTypeInputChange('price', price)
  }

  insertMaxVolume () {
    const volume = summarizeSessionTrades(this.session!).volume.toString()
    this.names['volume'].value = volume
    this.onNumberTypeInputChange('volume', volume)
  }

  async removeSession (session: TradeSession) {
    try {
      await window.app.confirmDialog.open('Deleting Session', html`The session and all the trades inside will be lost.<br>Are you sure to continue?`)
      this.tradesManager.deleteSession(session)
      this.requestUpdate()
      window.app.toast('session deleted')
      window.spacesManager.save()
    } catch (e) {
      // window.app.toast('canceled')
    }
  }

  open (session?: TradeSession) {
    if (session) {
      if (!this.session) {
        this.hardReset()
      }
      this.setSession(session)
    }
    else {
      if (this.session) {
        this.hardReset()
      }
    }
    this.tradeDialog.show()
  }

  private refreshTimeout?: NodeJS.Timeout;
  refreshUI () {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = undefined
    }

    this.refreshTimeout = setTimeout(() => this.requestUpdate(), 1000)
  }
}