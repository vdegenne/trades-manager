import { Dialog } from "@material/mwc-dialog";
import { Radio } from "@material/mwc-radio";
import { TextField } from "@material/mwc-textfield";
import { css, customElement, html, LitElement, property, query } from "lit-element";
import { nothing } from "lit-html";
import { SessionViewOptions } from "./options/options";
import sessionsStyles from "./styles/sessions-styles";
import { isTCodeComplete, resolveTCode, TCode, validateTCode } from "./tcode";
import { TradeSession } from "./TradesManager";
import { firstLetterUpperCase } from "./util";


@customElement('t-code-interface')
export class TCodeInterface extends LitElement {
  @property()
  // private tcode;

  @property()
  private validity = false;

  @property({type:Array})
  private sessions: TradeSession[] = []
  private lockSessions = false;

  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-textfield') textfield!: TextField;
  @query('mwc-radio[checked]') checkedSession!: Radio;

  static styles = [
    sessionsStyles,
    css`
    #sessions {
      min-height: 100px;
    }
    `
  ]

  render () {
    return html`
    <mwc-dialog heading="T-Code" style="--mdc-dialog-min-width:${window.innerWidth > 560 ? `${Math.min(window.innerWidth - 40, 900)}px`: '280px'}">
      <div>
        <p>Use a <b>t-code</b> to quickly add a trade entry (learn more)</p>
        <mwc-textfield type="text" outlined style="width:100%" initialFocusAttribute
          helperPersistent helper="${this.textfield ? ['exchange', 'symbol', 'quote', 'type', 'price', 'quantity', 'fees (optional)'][this.textfield.value.split(':').length - 1] : 'exchange'}"
          @keyup="${() => this.onTextFieldKeypress()}"></mwc-textfield>

        <div id="sessions">
          ${this.sessions.length ? html`<h3 style="margin: 41px 0 4px;font-weight:500">It will be added to :</h3>` : nothing }
          ${this.sessions.map((session, i) => {

            if (session.virtual) return nothing;

            return html`
            <!-- <mwc-formfield label=""> -->
            <div style="display:flex;align-items:center;">
            <mwc-radio name="session" value="${session.id}" ?checked="${i === 0}"></mwc-radio>
            ${window.sessionsView.sessionExternalTemplate(session,
              Object.assign({}, window.options.sessionViewOptions, { events: false, showCross: false, showPrice: false } as Partial<SessionViewOptions>))}
            </div>
            <!-- </mwc-formfield> -->`
          })}
        </div>
      </div>

      <mwc-button unelevated slot="primaryAction"
        ?disabled="${!this.validity}"
        @click="${(e) => this.submit()}">submit</mwc-button>
      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  firstUpdated() {
    window.addEventListener('keypress', e => {
      if (e.key === 't' && !e.ctrlKey && !e.altKey) {
        this.open()
      }
    })
  }

  private onTextFieldKeypress() {
    this.textfield.setCustomValidity('')
    this.textfield.reportValidity()
    this.validity = false

    // const tcode = TCodeInterface.resolveTCode(this.tcode);
    // if (tcode === undefined) { return }
    let tcode = resolveTCode(this.textfield.value)
    try {
      validateTCode(this.textfield.value)
    } catch (e) {
      this.reportValidity(e.message)
    }

    if (!this.lockSessions) {
      // if the sessions are not locked we should update them on input change
      if (['exchange', 'symbol', 'quote'].every(prop => prop in tcode)) {
        this.sessions = window.tradesManager.getSessions(tcode.exchange!, tcode.symbol!, tcode.quote!);
      }
      else {
        this.sessions = []
      }
    }

    if (!isTCodeComplete(tcode)) {
      return;
    }

    this.validity = true;
  }

  private async submit() {
    if (!this.validity) { return }
    const tcode = resolveTCode(this.textfield.value) as TCode;
    let session;

    if (this.checkedSession === null) {
      // we should ask if the user intended to create the session
      try {
        await window.confirmDialog.open('Create New Session', html`
        <p style="margin-right:12px">The session <b>${tcode.symbol}-${tcode.quote}</b> on <b>${firstLetterUpperCase(tcode.exchange)}</b> doesn't exist.<br>
        Do you want to create it ?</p>
        `)
        session = window.sessionsInterface.createSession(tcode.exchange, tcode.symbol, tcode.quote)
      } catch (e) {
        return // canceled
      }
    } else {
      session = window.tradesManager.getSessionFromId(parseInt(this.checkedSession.value))
    }

    try {
      await window.tradesInterface.addTrade(session, {
        type: tcode.type,
        price: tcode.price,
        volume: tcode.quantity,
        fees: tcode.fees || 0
      })
    } catch (e) {
      return; // canceled
    }

    this.dialog.close()
    this.reset()
  }

  reportValidity (message: string) {
    this.textfield.validationMessage = message;
    this.textfield.setCustomValidity(message)
    this.textfield.reportValidity()
  }


  public open () {
    this.requestUpdate() // used to resize the width if the screen width changes
    this.dialog.show()
    setTimeout(() => this.textfield.focus(), 300)
  }

  reset () {
    this.textfield.value = ''
    this.sessions = []
    this.lockSessions = false;
    this.validity = false;
  }
}