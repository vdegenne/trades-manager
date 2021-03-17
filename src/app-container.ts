import {customElement, html, LitElement, query} from 'lit-element'
import { TradesInterface } from './TradesInterface';
import '@material/mwc-snackbar'
import { Snackbar } from '@material/mwc-snackbar';

declare global {
  interface Window {
    app: AppContainer
  }
}

@customElement('app-container')
class AppContainer extends LitElement {
  public tradesInterface: TradesInterface;

  @query('mwc-snackbar') snackbar!: Snackbar;

  constructor() {
    super()
    window.app = this

    this.tradesInterface = new TradesInterface()
  }

  render () {
    return html`

    ${this.tradesInterface}

    <mwc-snackbar></mwc-snackbar>
    `
  }

  toast (message: string) {
    this.snackbar.labelText = message;
    this.snackbar.show()
  }
}