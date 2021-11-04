import { LitElement, html, css } from 'lit';
import { customElement, property, query, queryAll } from 'lit/decorators.js'
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-radio'
import '@material/mwc-textfield'
import '@material/mwc-formfield'
import { SessionStrip } from "./session-strip";
import { Dialog } from "@material/mwc-dialog";
// import { Alert } from "./TradesManager";
import { TextField } from "@material/mwc-textfield";
import { Radio } from "@material/mwc-radio";

@customElement('session-alert')
export class SessionAlert extends LitElement {

  @property({type:Object})
  strip!: SessionStrip;

  @query('mwc-dialog') dialog!: Dialog;
  @queryAll('mwc-radio') radios!: Radio[];
  @query('mwc-textfield') valueTextField!: TextField;

  static styles = [
    css`
    p {
      margin-bottom: 10px;
    }
    `
  ]
  render() {
    const alert = this.strip?.session.alert || {
      limit: '>',
      value: 0,
      notified: false
    }

    return html`

    <mwc-dialog heading="Alert">

      <p>limit</p>
      <mwc-formfield label="＞">
        <mwc-radio value=">" ?checked="${alert.limit === '>'}"></mwc-radio>
      </mwc-formfield>
      <mwc-formfield label="＜">
        <mwc-radio value="<" ?checked="${alert.limit === '<'}"></mwc-radio>
      </mwc-formfield>

      <p>value</p>
      <mwc-textfield type="number" outlined .value="${alert.value.toString()}"></mwc-textfield>


      <mwc-button outlined slot="secondaryAction" dialogAction="close">cancel</mwc-button>
      <mwc-button raised slot="primaryAction"
        @click="${() => this.submit()}">${this.hasAlert ? 'update' : 'create'}</mwc-button>
    </mwc-dialog>
    `
  }

  get hasAlert () {
    return !!this.strip?.session.alert;
  }

  get selectedRadio () {
    return [...this.radios].find(el => el.checked)
  }


  public open(strip: SessionStrip) {
    this.strip = strip;
    this.dialog.show()
  }

  private submit () {
    const hasAlert = this.hasAlert;

    const alert = {
      limit: this.selectedRadio!.value as '>'|'<',
      value: parseFloat(this.valueTextField.value),
      notified: false
    }

    this.strip.session.alert = alert;

    if (hasAlert) {
      window.app.toast('alert updated')
    }
    else {
      window.app.toast('alert created')
    }

    this.dialog.close()

    // we make sure to update the interface
    // to persist the new data and trigger further changes
    this.requestUpdate()
    this.strip.requestUpdate()

    window.spacesManager.save()
  }
}