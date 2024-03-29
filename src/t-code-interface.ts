import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Dialog } from "@material/mwc-dialog";
import { Radio } from "@material/mwc-radio";
import { TextField } from "@material/mwc-textfield";
// import { SessionViewOptions } from "./options/options";
import { SessionStrip } from "./session-strip";
import sessionsStyles from "./styles/sessions-styles";
import { isTCodeComplete, resolveTCode, TCode, validateTCode } from "./tcode";
import { TradeSession } from "./TradesManager";
import { firstLetterUpperCase } from "./util";


@customElement('t-code-interface')
export class TCodeInterface extends LitElement {
  // @property()
  // private tcode;

  @state()
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
    let sessionIndex = -1;
    return html`
    <mwc-dialog heading="T-Code" style="--mdc-dialog-min-width:${window.innerWidth > 560 ? `${Math.min(window.innerWidth - 40, 900)}px`: '280px'}">
      <div>
        <p>Use a <span>t-code</span> to quickly add a trade entry (learn more)</p>
        <mwc-textfield type="text" outlined style="width:100%" initialFocusAttribute
          helperPersistent helper="${this.textfield ? ['exchange', 'symbol', 'quote', 'type', 'price', 'quantity', 'fees (optional)'][this.textfield.value.split(':').length - 1] : 'exchange'}"
          @keyup="${(e) => this.onTextFieldKeypress(e)}"></mwc-textfield>

        <div id="sessions">
          ${this.sessions.length ? html`<h3 style="margin: 41px 0 4px;font-weight:500">It will be added to :</h3>` : nothing }
          ${this.sessions.reverse().map((session, i) => {

            if (session.virtual) return nothing;

            sessionIndex++;

            return html`
            <!-- <mwc-formfield label=""> -->
            <div style="display:flex;align-items:center;">
              <mwc-radio name="session" value="${session.id}" ?checked="${sessionIndex === 0}"></mwc-radio>
              <session-strip .session=${session} .viewOptions=${{ events: false, showCross: false, showPrice: false }} style="width:100%"></session-strip>
              <!-- ${new SessionStrip(session, { events: false, showCross: false, showPrice: false })} -->
            </div>
            <!-- </mwc-formfield> -->`
          })}
          ${this.sessions.length && !this.lockSessions ? html`<mwc-formfield label="new session"><mwc-radio name="session" value=""></mwc-radio></mwc-formfield>` : nothing }
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
        if (this.dialog.open === false)
          this.open()
      }
    })
  }

  private onTextFieldKeypress(e) {
    e.stopImmediatePropagation()
    this.textfield.setCustomValidity('')
    this.textfield.reportValidity()
    this.validity = false

    // const tcode = TCodeInterface.resolveTCode(this.tcode);
    // if (tcode === undefined) { return }
    let tcode = resolveTCode(this.textfield.value)
    try {
      validateTCode(this.textfield.value)
    } catch (e: any) {
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

    if (this.sessions.length && !this.checkedSession) {
      window.app.toast('Please, select an option.')
      return;
    }

    if (this.checkedSession === null || this.checkedSession.value === '') {

      // we should ask if the user intended to create the session
      // unless he explicitely choosed a new one from the radio
      if (this.checkedSession === null) {
        try {
          await window.confirmDialog.open('Create New Session', html`
            <p style="margin-right:12px">The session <span>${tcode.symbol}-${tcode.quote}</span> on <span>${firstLetterUpperCase(tcode.exchange)}</span> doesn't exist.<br>
            Do you want to create it ?</p>
          `)
        } catch (e) { return /* canceled */ }
      }

      session = window.sessionsInterface.createSession(tcode.exchange, tcode.symbol, tcode.quote)
    } else {
      session = window.tradesManager.getSessionFromId(parseInt(this.checkedSession.value))
    }

    try {
      await window.tradesInterface.addTrade(session, {
        type: tcode.type,
        price: tcode.price,
        volume: tcode.quantity,
        fees: tcode.fees || 0,
        date: Date.now(),
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


  public open (session?: TradeSession) {
    this.reset()
    // this.requestUpdate() // used to resize the width if the screen width changes
    // if a session is provided we should lock the sessions array because it's a targetted selection
    if (session) {
      this.sessions = [session]
      this.lockSessions = true;
    }
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