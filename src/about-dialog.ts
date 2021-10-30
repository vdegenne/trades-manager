import { LitElement, html } from 'lit'
import { customElement, query } from 'lit/decorators.js';
import { Dialog } from "@material/mwc-dialog";

@customElement('about-dialog')
export class AboutDialog extends LitElement {
  @query('mwc-dialog') dialog!: Dialog;

  render () {
    return html`
    <mwc-dialog heading="${window.appTitle} (v1.0)">
      <div style="width:1000px"></div>
      <div>
        ${window.appTitle} is a small app you can use to organize your tradings.

        <h3>Benefits</h3>
        < to complete >

        <h3>What ${window.appTitle} is not</h3>
        <p>${window.appTitle} is not a portfolio manager.<br>
        You can use ${window.appTitle} to make a quick porfolio based on your recent tradings, but chances are things will get a little clunky as new trades happen.
        Because pairs are not connected.</p>
        <p>Let's say you buy 10 ETH on the pair <b>ETH-EUR</b> and 10 more ETH on the pair <b>ETH-USD</b>.<br>
        First of all, you have 20 ETH but they are organized in different pairs.
        But things get more complicated if you decide to create the pair <b>CVC-ETH</b> and buy some CVC with the ETH you have.<br>
        If you do so, now the pair <b>ETH-EUR</b> and <b>ETH-USD</b> are still updating and showing you the profit you make but from the original state (the 20 ETH you bought are still in the system.)<br>
        You should know that.

        <h3>Ideally</h3>
        <p>You should make a pair only if you are sure that the values you invest in that pair will only be used in that pair and nowhere else (That's also the reason why pairs are also called "sessions" on the app.)</p>
        <p>If you are pragmatic you can try to manage the connected pairs manually.</p>
      </div>

      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  public open () {
    this.dialog.show()
  }
}