import { Dialog } from "@material/mwc-dialog";
import { css, customElement, html, LitElement, property, query } from "lit-element";
import { ExchangesManager } from "../ExchangesManager";
import { SessionStrip } from "../session-strip";
import sessionsStyles from "../styles/sessions-styles";
import { TradeSession } from "../TradesManager";
import { Options, OptionsManager, SessionViewOptions } from "./options";


@customElement('options-interface')
export class OptionsInterface extends LitElement {
  @property({type:Object})
  private optionsManager: OptionsManager;

  @property({type:Object})
  private options: Options; // clone object for the interface

  /* Fake element to show how the display settings affect a session element */
  private session: TradeSession = {
    id: 0,
    exchange: 'kraken',
    symbol: 'BTC', quote: 'USDT',
    trades: [{ type: 'buy', price: 55800, volume: 0.01 }],
    virtual: false
  };
  private strip = new SessionStrip(this.session)

  constructor (options?: Options) {
    super()
    window.optionsInterface = this

    this.optionsManager = new OptionsManager(options)

    this.options = JSON.parse(JSON.stringify(this.optionsManager.options))
  }

  static styles = [
    sessionsStyles,
    css`
    h4 {
      margin: 33px 0px 5px;
      font-weight: 500;
    }
    `
  ]

  @query('mwc-dialog') dialog!: Dialog;

  render () {

    this.strip.viewOptions = Object.assign({}, this.options.sessionViewOptions, { events: false });

    return html`
    <mwc-dialog heading="Options">
      <div style="width:600px"></div>
      <div>
        <h4>Session view options</h4>
        <mwc-formfield label="pair price">
          <mwc-checkbox ?checked="${this.options.sessionViewOptions.showPrice}"
            @change="${(e) => this.changeSessionViewOption(e, 'showPrice')}"></mwc-checkbox>
        </mwc-formfield>
        <mwc-formfield label="source profit">
          <mwc-checkbox ?checked="${this.options.sessionViewOptions.showSourceProfit}"
            @change="${(e) => this.changeSessionViewOption(e, 'showSourceProfit')}"></mwc-checkbox>
        </mwc-formfield>
        <mwc-formfield label="total value">
          <mwc-checkbox ?checked="${this.options.sessionViewOptions.showTotalValue}"
            @change="${(e) => this.changeSessionViewOption(e, 'showTotalValue')}"></mwc-checkbox>
        </mwc-formfield>
        <mwc-formfield label="percentage">
          <mwc-checkbox ?checked="${this.options.sessionViewOptions.showPercent}"
            @change="${(e) => this.changeSessionViewOption(e, 'showPercent')}"></mwc-checkbox>
        </mwc-formfield>

        ${this.strip}

        <h4>General view options</h4>
        <mwc-formfield label="Show wallet at the bottom">
          <mwc-checkbox ?checked="${this.options.exchangeViewOptions.showWallet}"
            @change="${(e) => {this.options.exchangeViewOptions.showWallet = e.target.checked; this.requestUpdate()}}"></mwc-checkbox>
        </mwc-formfield>
        <br>
        <mwc-formfield label="Show virtual sessions ( shortcut: v )">
          <mwc-checkbox ?checked="${this.options.exchangeViewOptions.showVirtual}"
            @change="${(e) => {this.options.exchangeViewOptions.showVirtual = e.target.checked; this.requestUpdate()}}"></mwc-checkbox>
        </mwc-formfield>
      </div>

      <mwc-button outlined slot="secondaryAction" dialogAction="close">cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        @click="${() => this.saveAndClose()}">save</mwc-button>
    </mwc-dialog>
    `
  }

  requestUpdate() {
    this.strip.requestUpdate()
    return super.requestUpdate()
  }

  async firstUpdated() {
    // we make sure the pair BTC USDT is registered for the session template to show the right data
    await ExchangesManager.addPair('kraken', 'BTC', 'USDT', false)
    await ExchangesManager.exchanges['kraken'].updatePairs()
    this.requestUpdate()


    window.addEventListener('keypress', e => {
      if (!e.ctrlKey && !e.altKey && e.code === 'KeyV') {
        this.options.exchangeViewOptions.showVirtual = !this.options.exchangeViewOptions.showVirtual;
        window.sessionsInterface.requestUpdate()
        this.requestUpdate()
        this.save()
      }
    })
  }

  changeSessionViewOption (e, property: string) {
    this.options.sessionViewOptions[property] = e.target.checked;
    this.requestUpdate()
  }

  open () {
    // on opening we clone the current options object
    // so any changes are not forwarded to the main UI
    this.options = JSON.parse(JSON.stringify(this.optionsManager.options))
    this.dialog.show()
  }

  saveAndClose () {
    this.save()
    this.dialog.close()
    window.sessionsInterface.requestUpdate()
    window.app.toast('settings updated')
  }

  save () {
    this.optionsManager.loadOptions(this.options)
    this.optionsManager.save()
  }
}


declare global {
  interface Window {
    optionsInterface: OptionsInterface;
    options: Options;
  }
}