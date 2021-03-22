import { Dialog } from "@material/mwc-dialog";
import { TextField } from "@material/mwc-textfield";
import { customElement, html, LitElement, property, query } from "lit-element";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { Aggregator, AggregatorUnit } from "./profit-aggregator";
import { WalletsData } from "./SpacesManager";
import { firstLetterUpperCase, formatOutputAggregation, formatOutputPrice } from "./util";

export type Wallets = {
  [key in AvailableExchanges]: Aggregator
}

declare global {
  interface Window {
    walletsManager: WalletsManager;
    wallets: () => Wallets;
  }
}

@customElement('wallets-manager')
export class WalletsManager extends LitElement {
  @property()
  public wallets: Wallets;

  @property()
  private exchangeName?: string;

  @query('mwc-dialog') dialog!: Dialog;
  @query('#funds-textfield') fundsTextfield!: TextField;

  constructor() {
    super()

    // @ts-ignore
    this.wallets = WalletsManager.generateEmptyWallet();

    window.walletsManager = this
    window.wallets = () => this.wallets
  }

  static generateEmptyWallet () {
    return Object.fromEntries(Object.keys(ExchangesManager.exchanges).map(name => [name, new Aggregator(name as AvailableExchanges)])) as Wallets;
  }

  render () {
    return html`
    <mwc-dialog heading="Funds">
      <div>
        <p>How many ${window.spacesManager.space?.currency} do you have in your balance on ${firstLetterUpperCase(this.exchangeName)}?</p>
        <mwc-textfield id="funds-textfield" outlined type="number" min="0" step="0.01" style="width:100%"
          .value="${this.wallets[this.exchangeName!]}"></mwc-textfield>
        
        <p>Do not include the funds that are in the form of trades on the market. Only ${window.spacesManager.space?.currency} in your balance on your exchange.</p>
      </div>

      <mwc-button outlined slot="secondaryAction" dialogAction="close">close</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        @click="${this.onFundsDialogUpdate}">update</mwc-button>
    </mwc-dialog>
    `
  }

  walletTemplate (walletAggregator: Aggregator) {
    return html`
    <div style="display:flex;align-items:center;padding:8px 11px;background-color:#eeeeee;border-radius:5px 5px 0 0;margin: 5px 0">
        <div style="font-weight:500">Wallet :</div>
        <div style="color:#3f51b5;margin-left:12px">${formatOutputAggregation(walletAggregator) || 'empty'}</div>
    </div>
    `
  }

  loadWallets (wallets: WalletsData) {
    this.wallets = Object.fromEntries(Object.entries(wallets).map(([exchangeName, units]) => {
      return [exchangeName as AvailableExchanges, new Aggregator(exchangeName as AvailableExchanges, units)]
    })) as Wallets
  }

  private onFundsDialogUpdate () {
    this.wallets[this.exchangeName!] = parseFloat(this.fundsTextfield.value)
    this.dialog.close()
    window.tradesInterface.requestUpdate()
    window.spacesManager.save()
  }

  openWallet (exchangeName: string) {
    this.exchangeName = exchangeName
    this.dialog.show()
  }
}