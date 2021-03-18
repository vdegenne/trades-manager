import {css, customElement, html, LitElement, query} from 'lit-element'
import { TradesInterface } from './trades-interface';
import '@material/mwc-snackbar'
import './confirm-dialog'
import { Snackbar } from '@material/mwc-snackbar';
import { ConfirmDialog } from './confirm-dialog';

declare global {
  interface Window {
    app: AppContainer
  }
}

@customElement('app-container')
class AppContainer extends LitElement {
  public tradesInterface: TradesInterface;

  @query('mwc-snackbar') snackbar!: Snackbar;
  @query('confirm-dialog') confirmDialog!: ConfirmDialog;

  constructor() {
    super()
    window.app = this

    this.tradesInterface = new TradesInterface()
  }

  static styles = css`
  :host {
    --mdc-theme-primary: #004d40;
  }
  `

  render () {
    return html`
    ${this.tradesInterface}

    <confirm-dialog></confirm-dialog>

    <mwc-snackbar></mwc-snackbar>
    `
  }

  toast (message: string) {
    this.snackbar.labelText = message;
    this.snackbar.show()
  }
}