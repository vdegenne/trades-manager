import { customElement, html, LitElement, property } from "lit-element";

@customElement('t-code-interface')
export class TCodeInterface extends LitElement {
  @property()
  private tcode;
  
  render () {
    return html`
    <mwc-dialog heading="T-Code">
      <div>
        <mwc-textfield type="text"
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
}