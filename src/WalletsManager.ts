import { customElement, LitElement } from "lit-element";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";

export type Wallets = {
  [key in AvailableExchanges]: number
}

@customElement('wallets-manager')
export class WalletsManager extends LitElement {
  private wallets: Wallets;

  constructor() {
    super()

    // @ts-ignore
    this.wallets = WalletsManager.generateEmptyWallet();
  }

  static generateEmptyWallet () {
    return Object.fromEntries(Object.keys(ExchangesManager.exchanges).map(name => [name, 0])) as Wallets;
  }
}