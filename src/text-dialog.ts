import { Dialog } from "@material/mwc-dialog";
import { customElement, html, LitElement, property, query, TemplateResult } from "lit-element";

@customElement('text-dialog')
export class TextDialog extends LitElement {
  @property()
  private heading?: string;
  @property()
  private message?: string|TemplateResult;

  @query('mwc-dialog') dialog!: Dialog;

  render () {
    return html`
    <mwc-dialog heading="${this.heading ?? ''}">
      <div>
        ${this.message}
      </div>

      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  open(heading: string, message: string|TemplateResult) {
    this.heading = heading;
    this.message = message;
    this.dialog.show()
  }
}
