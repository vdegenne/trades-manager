import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Dialog } from "@material/mwc-dialog";

@customElement('text-dialog')
export class TextDialog extends LitElement {
  @property()
  private heading?: string;
  @property()
  private message?: string|TemplateResult;
  @property()
  private buttonTitle;

  private resolveFunction;

  @query('mwc-dialog') dialog!: Dialog;

  render () {
    return html`
    <mwc-dialog heading="${this.heading ?? ''}" escapeKeyAction="" scrimClickAction="">
      <div>
        ${this.message}
      </div>

      <mwc-button outlined slot="primaryAction" @click="${() => {this.resolveFunction(); this.dialog.close()}}">${this.buttonTitle}</mwc-button>
    </mwc-dialog>
    `
  }

  open(heading: string, message: string|TemplateResult, buttonTitle?: string) {
    this.heading = heading;
    this.message = message;
    this.buttonTitle = buttonTitle || 'close';
    this.dialog.show()
    return new Promise(resolve => {
      this.resolveFunction = resolve;
    })
  }
}
