import {customElement, html, LitElement} from 'lit-element'
import { TradeManager, Trades } from './trades'
import { TradesInterface } from './TradesInterface';

declare global {
  interface Window {
    app: AppContainer
  }
}

@customElement('app-container')
class AppContainer extends LitElement {
  private tradesInterface: TradesInterface;

  constructor() {
    super()
    window.app = this

    this.tradesInterface = new TradesInterface()
  }

  render () {
    return html`

    ${this.tradesInterface}
    `
  }
}