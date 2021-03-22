import { Dialog } from "@material/mwc-dialog";
import { customElement, html, LitElement, property, query } from "lit-element";

@customElement('t-code-interface')
export class TCodeInterface extends LitElement {
  @property()
  private tcode;

  @query('mwc-dialog') dialog!: Dialog;
  
  render () {
    return html`
    <mwc-dialog heading="T-Code">
      <div>
        <p>Use a <b>t-code</b> to quickly add a trade entry (learn more)</p>
        <mwc-textfield type="text" outlined style="width:100%"
          @keyup="${(e) => this.tcode = e.target.value}"></mwc-textfield>
      </div>

      <mwc-button unelevated slot="primaryAction"
        ?disabled="${!this.tcode}"
        @click="${(e) => this.submit()}">submit</mwc-button>
      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  private submit() {
    
  }

  resolveTCode () {
    
  }

  public open () {
    this.dialog.show()
  }
}