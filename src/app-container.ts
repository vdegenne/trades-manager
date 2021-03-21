import {css, customElement, html, LitElement, property, query} from 'lit-element'
import { TradesInterface } from './trades-interface';
import '@material/mwc-dialog'
import '@material/mwc-button'
import '@material/mwc-select'
import '@material/mwc-checkbox'
import '@material/mwc-snackbar'
import '@material/mwc-formfield'
import '@material/mwc-icon-button'
import './confirm-dialog'
import { Snackbar } from '@material/mwc-snackbar';
import { ConfirmDialog } from './confirm-dialog';
import { Dialog } from '@material/mwc-dialog';
import { SpacesManager } from './SpacesManager';
import { Wallets, WalletsManager } from './WalletsManager';
import {TextDialog} from './text-dialog'
import './text-dialog'

declare global {
  interface Window {
    app: AppContainer
    textDialog: TextDialog
  }
}

export const Currencies = ['EUR', 'USD'] as const
export type Currency = typeof Currencies[number]

@customElement('app-container')
class AppContainer extends LitElement {
  public spacesManager: SpacesManager = new SpacesManager();

  public tradesInterface: TradesInterface;

  @property()
  private walletsManager: WalletsManager;

  @query('mwc-snackbar') snackbar!: Snackbar;
  @query('confirm-dialog') confirmDialog!: ConfirmDialog;
  @query('mwc-dialog[heading=Options]') optionsDialog!: Dialog;
  @query('text-dialog') textDialog!: TextDialog;

  constructor() {
    super()
    window.app = this

    this.tradesInterface = new TradesInterface()

    this.walletsManager = new WalletsManager()
  }

  static styles = css`
  :host {
    display: block;
    --mdc-theme-primary: #004d40;
    max-width: 800px;
    margin: 0 auto;
    padding: 10px 10px;
  }

  .dialog-content > p {
    margin-bottom: 6px;
  }
  `

  render () {
    return html`
    <header style="margin:7px 0 32px 10px;display:flex;align-items:center;justify-content:space-between">
      <img src="./images/logo.jpeg" width="48px" height="48px">
      <div style="display:flex;align-items:center">
        <mwc-button outlined icon="space_dashboard" style="margin-right:6px"
          @click="${() => this.toast('Space feature coming soon ;-)')}">${window.spacesManager.space?.name}</mwc-button>
        <mwc-icon-button icon="settings" @click="${() => this.optionsDialog.show()}"></mwc-icon-button>
      </div>
    </header>

    ${this.spacesManager}

    ${this.walletsManager}

    ${this.tradesInterface}

    <mwc-dialog heading="Options">
      <div style="width:800px"></div>
      <div class="dialog-content">
        <p>Preferred currency</p>
        <mwc-select id="currency" style="width:100%"
            @change="${e => this.currency = e.target.value}">
          ${Currencies.map(currency => html`
          <mwc-list-item value="${currency}" ?selected="${currency === this.currency}">${currency}</mwc-list-item>`)}
        </mwc-select>

        <p></p>
        <mwc-formfield label="Convert quotes in sessions also">
          <mwc-checkbox></mwc-checkbox>
        </mwc-formfield>
      </div>
      <div style="height:42px"></div>

      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>

    <confirm-dialog></confirm-dialog>
    <text-dialog></text-dialog>

    <mwc-snackbar leading></mwc-snackbar>
    `
  }

  firstUpdated() {
    window.textDialog = this.textDialog;
  }

  toast (message: string) {
    this.snackbar.labelText = message;
    this.snackbar.show()
  }
}