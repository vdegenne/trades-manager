import { Checkbox } from "@material/mwc-checkbox";
import { Dialog } from "@material/mwc-dialog";
import { Select } from "@material/mwc-select";
import { css, customElement, html, LitElement, property, query } from "lit-element";
import { nothing } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { TradeSession } from "./trades";
import { firstLetterUpperCase, sortAlphabetically, openVirtualInfoDialog } from "./util";

@customElement('session-create-dialog')
export class SessionCreateDialog extends LitElement {
  @property()
  private exchange?: AvailableExchanges;
  @property()
  private symbol?: string;
  @property()
  private quote?: string;

  @query('mwc-dialog') dialog!: Dialog;
  @query('[name=virtual]') virtualCheckbox!: Checkbox;

  static styles = css`
    mwc-select, select {
      width: 100%;
    }
  `
  
  render () {
    let symbols, quotes
    if (this.exchange) {
      symbols = sortAlphabetically(ExchangesManager.getAvailableSymbols(this.exchange))
      if (this.symbol) {
        quotes = sortAlphabetically(ExchangesManager.getAvailableQuotesFromSymbol(this.exchange, this.symbol))
      }
    }


    return html`
    <mwc-dialog heading="Create Session on ${firstLetterUpperCase(this.exchange)}"
        @opened="${this.fixOverflow}">
      <div style="width:400px"></div>
      <div>
        <div style="display:flex;align-items:center">
          <mwc-formfield label="virtual">
            <mwc-checkbox name="virtual"></mwc-checkbox>
          </mwc-formfield>
          <mwc-icon style="cursor:pointer;--mdc-icon-size:18px;margin-left:6px" @click="${openVirtualInfoDialog}">help_outline</mwc-icon>
        </div>

        <p>Symbol</p>
        ${this.exchange !== 'others'
        ? html`
          <mwc-select outlined name="symbol"
              value="${ifDefined(this.symbol)}"
              @change="${this.onSymbolSelectChange}">
            <mwc-list-item></mwc-list-item>
            ${symbols ? symbols.map(symbol => {
              return html`<mwc-list-item value="${symbol}">${symbol}</mwc-list-item>`
            }) : nothing }
          </mwc-select>
        `
        : html`
          <select name="symbol"
              value="${ifDefined(this.symbol)}"
              @change="${this.onSymbolSelectChange}">
            <option></option>
            ${symbols ? symbols.map(symbol => {
              return html`<option value="${symbol}">${symbol}</option>`
            }) : nothing }
          </select>
        ` }

        <p>Quote</p>
        <mwc-select outlined name="quote"
            value="${ifDefined(this.quote)}"
            ?disabled="${this.exchange !== undefined && !this.symbol}"
            @change="${(e) => this.quote = e.target.value}">
          <mwc-list-item></mwc-list-item>
          ${quotes ? quotes.map(quote => {
            return html`<mwc-list-item value="${quote}">${quote}</mwc-list-item>`
          }) : nothing }
        </mwc-select>

        <div style="display:flex;justify-content:center;align-items:center;margin:42px;font-size:32px">
         <span style="color:black;">${this.symbol || '??'}</span>
         <mwc-icon style="--mdc-icon-size:32px;margin:10px;">sync_alt</mwc-icon>
         <span style="color:black">${this.quote || '??'}</span>
        </div>
      </div>

      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
      <mwc-button unelevated slot="primaryAction" ?disabled="${!this.symbol || !this.quote}"
        @click="${this.submit}">create</mwc-button>
    </mwc-dialog>
    `
  }

  fixOverflow() {
    this.dialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__surface')!.style.overflowY = 'visible'
    this.dialog.shadowRoot!.querySelector<HTMLElement>('.mdc-dialog__content')!.style.overflow = 'visible'
  }

  submit () {
    const session = window.tradesInterface.tradesManager.createSession(this.exchange!, this.symbol!, this.quote!)
    ExchangesManager.addPair(session.exchange, session.symbol, session.quote, false)
    window.tradesInterface.requestUpdate()
    ExchangesManager.exchanges[session.exchange].updatePairs()
    // window.sessionInterface.openSession(session)
    this.dialog.close()
    window.spacesManager.save()
  }

  onSymbolSelectChange (e) {
    this.symbol = e.target.value
  }

  open (exchangeName: AvailableExchanges) {
    this.dialog.show()
    this.exchange = exchangeName;
    this.symbol = ''
    this.quote = ''
    this.virtualCheckbox.checked = false
  }
}