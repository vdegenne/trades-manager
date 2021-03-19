import { Dialog } from "@material/mwc-dialog";
import { customElement, html, LitElement, property, query } from "lit-element";
import { Currencies, Currency } from "./app-container";
import { ExchangesManager } from "./ExchangesManager";
import { TradeSession } from "./trades";
import { Wallets, WalletsManager } from "./WalletsManager";

export type Space = {
  name: string;
  currency: Currency;
  sessions: TradeSession[];
  wallets: Wallets;
}

declare global {
  interface Window {
    spacesManager: SpacesManager
    spaces: () => Space[]
  }
}

@customElement('spaces-manager')
export class SpacesManager extends LitElement {
  private spaces: Space[] = [];

  space?: Space;

  @property()
  private currency?: typeof Currencies[number];

  @query('#currency-dialog') currencyDialog!: Dialog;

  constructor() {
    super()
    window.spacesManager = this
    window.spaces = () => this.spaces;
  }

  render() {
    return html`
    <mwc-dialog id="currency-dialog" heading="Choose Currency" escapeKeyAction="" scrimClickAction=""
        @change="${e => this.currency = e.target.value}">
      <p>What currency will you trade with ?</p>
      <mwc-select style="width:100%">
        ${Currencies.map(c => html`<mwc-list-item value="${c}">${c}</mwc-list-item>`)}
      </mwc-select>
      <div style="height:100px"></div>

      <mwc-button unelevated slot="primaryAction"
        ?disabled="${!this.currency}" @click="${() => this.askCurrencyResolve(this.currency)}">continue</mwc-button>
    </mwc-dialog>
    `
  }

  async firstUpdated () {
    // first we get data if any
    const spaces = localStorage.getItem('spaces') ? JSON.parse(localStorage.getItem('spaces')!.toString()) : undefined;

    // create default space if the data is not correct
    if (spaces === undefined || !(spaces instanceof Array) || spaces.length === 0) {
      // we should check if sessions is present or not in the localStorage,
      // if yes it means the data is from the old version
      const sessions = localStorage.getItem('trades') ? JSON.parse(localStorage.getItem('trades')!.toString()) : undefined;

      // if there is an id it means the data is old and is only containing sessions
      await this.createDefaultSpace(sessions)

      // we save the spaces with the default as a starter
      this.save()
      // and we remove trades from localStorage if it exists from the previous app version
      if (sessions) {
        localStorage.removeItem('trades')
      }
    }
    else {
      this.spaces = spaces
    }

    // we should load the space indentified in the url or default
    // @todo : load the space from url
    this.loadSpace(this.getDefaultSpace())
  }

  loadSpace (space: Space) {
    window.app.tradesInterface.loadSessions(space.sessions)

    this.space = space;
    window.app.requestUpdate()
    // console.log(this.toString());
  }


  private async createDefaultSpace (sessions?: TradeSession[]) {
    console.log(sessions);
    const currency = await this.askCurrency()
    this.currencyDialog.close()
    this.spaces.push({
      name: 'default',
      sessions: sessions || [],
      currency,
      wallets: WalletsManager.generateEmptyWallet()
    })
  }

  private getDefaultSpace () {
    return this.spaces.find(s => s.name === 'default')!
  }

  private askCurrencyResolve;
  private async askCurrency () {
    return await new Promise<Currency>(resolve => {
      this.askCurrencyResolve = resolve
      this.currencyDialog.show()
    })
  }

  save () {
    localStorage.setItem('spaces', this.toString())
  }

  toString () {
    return JSON.stringify(this.spaces)
  }
}