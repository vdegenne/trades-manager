
import "@material/mwc-list/mwc-list-item";import {LitElement, html} from 'lit'
import {customElement, property, query, queryAsync} from 'lit/decorators.js'
import { Dialog } from "@material/mwc-dialog";
import { Currencies, Currency } from "./app-container";
import { AvailableExchanges, ExchangesManager } from "./ExchangesManager";
import { AggregatorUnit } from "./profit-aggregator";
import { TradeSession } from "./TradesManager";

export type Space = {
  name: string;
  currency: Currency;
  sessions: TradeSession[];
  // wallets: WalletsData
}

export type WalletsData = {
  [key in AvailableExchanges]: AggregatorUnit[]
}

declare global {
  interface Window {
    spacesManager: SpacesManager
    spaces: () => Space[]
  }
}

@customElement('spaces-manager')
export class SpacesManager extends LitElement {
  public spaces: Space[] = [];

  space!: Space;

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
    <mwc-dialog id="currency-dialog" heading="Choose Currency" escapeKeyAction="" scrimClickAction="">
      <p>What currency will you trade with ?</p>
      <mwc-select style="width:100%"
        @change=${e => this.currency = e.target.value}>
        ${Currencies.map(c => html`<mwc-list-item value="${c}">${c}</mwc-list-item>`)}
      </mwc-select>
      <div style="height:100px"></div>

      <mwc-button unelevated slot="primaryAction"
        ?disabled="${!this.currency}" @click="${() => {this.askCurrencyResolve(this.currency); this.currencyDialog.close()}}">continue</mwc-button>
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
      // const sessions = localStorage.getItem('trades') ? JSON.parse(localStorage.getItem('trades')!.toString()) : undefined;

      // if there is an id it means the data is old and is only containing sessions
      this.createDefaultSpace()

      // we save the spaces with the default as a starter
      this.save()
      // and we remove trades from localStorage if it exists from the previous app version
      // if (sessions) {
      //   localStorage.removeItem('trades')
      // }
    }
    else {
      // we make sure we convert the wallet value to the new wallet version
      // spaces.forEach((space: Space) => {
      //   for (const wallet of Object.keys(space.wallets)) {
      //     if (!(space.wallets[wallet] instanceof Array)) {
      //       space.wallets[wallet] = []
      //     }
      //   }
      // })
      this.spaces = spaces
    }

    // Before anything else we make sure the pairs are served before trying to display the user's sessions.
    while (window.BinancePairs === undefined) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // we should load the space indentified in the url or default
    // @todo : load the space from url
    this.loadSpace(this.getDefaultSpace())
  }

  loadSpaces(spaces: Space[]) {
    this.spaces = spaces;
    // loading the default space by default
    this.loadSpace(this.getDefaultSpace())
  }

  loadSpace (space: Space) {
    window.sessionsInterface.loadSessions(space.sessions)

    // window.walletsManager.loadWallets(space.wallets)

    this.space = space;
    window.app.requestUpdate()
    // console.log(this.toString());
  }

  async createSpace (name: string) {
    // const currency = await this.askCurrency()
    const space: Space = {
      name,
      currency: 'EUR',
      sessions: []
    }

    this.spaces.push(space)
    return space;
  }

  private async createDefaultSpace () {
    // const currency = await this.askCurrency()
    this.spaces.push({
      name: 'default',
      sessions: [],
      currency: 'EUR',
      // @ts-ignore
      wallets: Object.fromEntries(Object.keys(ExchangesManager.exchanges).map((exchangeName) => {
        return [exchangeName, []]
      }))
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