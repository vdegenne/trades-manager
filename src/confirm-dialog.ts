import { customElement, html, LitElement, property, query, TemplateResult } from "lit-element";
import '@material/mwc-dialog'
import '@material/mwc-button'
import { Dialog } from "@material/mwc-dialog";
import sessionsStyles from "./styles/sessions-styles";

@customElement('confirm-dialog')
export class ConfirmDialog extends LitElement {
  @query('mwc-dialog') dialog!: Dialog;

  @property()
  private label: string = ''
  @property()
  private message: string|TemplateResult = ''
  @property()
  private alert;

  private promiseResolve;
  private promiseReject;

  static styles = [
    sessionsStyles
  ]

  render() {
    return html`
    <mwc-dialog heading="${this.label}">
      <div>${this.message}</div>

      <mwc-button outlined slot="secondaryAction" dialogAction="close"
        @click="${() => this.promiseReject()}">cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction" style="${this.alert ? '--mdc-theme-primary:#f44336' : ''}"
        @click="${() => {this.promiseResolve(); this.dialog.close()}}">confirm</mwc-button>
    </mwc-dialog>
    `
  }

  open(label: string, message: string|TemplateResult, alert = true) {
    if (!label) {
      label = 'Are you sure ?'
    }
    this.label = label;
    this.message = message;
    this.alert = alert;
    this.dialog.show()
    return new Promise((resolve, reject) => {
      this.promiseResolve = resolve;
      this.promiseReject = reject;
    })
  }
}