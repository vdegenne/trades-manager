import {css, customElement, html, LitElement, property, query} from 'lit-element'
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
import { WalletsManager } from './WalletsManager';
import {TextDialog} from './text-dialog'
import './text-dialog'
import { TCodeInterface } from "./t-code-interface";
import './t-code-interface'
import './about-dialog'
import { AboutDialog } from './about-dialog';
import { OptionsInterface } from './options/options-interface'
import { SessionsInterface } from './sessions-interface'

declare global {
  interface Window {
    app: AppContainer;
    appTitle: string;
    textDialog: TextDialog;
    confirmDialog: ConfirmDialog;
  }
}

export const Currencies = ['EUR', 'USD'] as const
export type Currency = typeof Currencies[number]

@customElement('app-container')
class AppContainer extends LitElement {
  public spacesManager: SpacesManager = new SpacesManager();

  public sessionsInterface: SessionsInterface; // considered as the main interface
  private tCodeInterface: TCodeInterface;
  private optionsInterface: OptionsInterface;

  private confirmDialog = new ConfirmDialog()

  @property()
  private walletsManager: WalletsManager;

  @query('mwc-snackbar') snackbar!: Snackbar;
  @query('mwc-dialog[heading=Options]') optionsDialog!: Dialog;
  @query('text-dialog') textDialog!: TextDialog;
  @query('about-dialog') aboutDialog!: AboutDialog;

  constructor() {
    super()
    window.app = this
    window.appTitle = 'Tradon'
    window.confirmDialog = this.confirmDialog

    this.sessionsInterface = new SessionsInterface()
    this.tCodeInterface = new TCodeInterface()
    this.optionsInterface = new OptionsInterface()

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
    <header style="margin:7px 0 42px 10px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;padding:4px 18px 4px 10px;border-radius:7px;background-color:#004d4017">
        <img src="./images/logo.png" width="60px" height="60px" style="position:absolute"><span style="margin-left:66px;font-size:24px;font-weight:500;color:var(--mdc-theme-primary);font-family:serial">${window.appTitle}</span>
      </div>
      <div style="display:flex;align-items:center">
        <!-- <mwc-button outlined icon="space_dashboard" style="margin-right:6px"
          @click="${() => this.toast('Space feature coming soon ;-)')}">${window.spacesManager.space?.name}</mwc-button> -->
        <mwc-icon-button icon="title" @click="${() => this.tCodeInterface.open()}"></mwc-icon-button>
        <mwc-icon-button icon="help_outline" @click="${() => this.aboutDialog.open()}"></mwc-icon-button>
        <mwc-icon-button icon="settings" @click="${() => this.optionsDialog.show()}"></mwc-icon-button>
      </div>
    </header>

    ${this.spacesManager}

    ${this.walletsManager}

    ${this.sessionsInterface}

    ${this.tCodeInterface}
    ${this.optionsInterface}

    <about-dialog></about-dialog>

    <mwc-dialog heading="Options">
      <div style="width:800px"></div>
      <div class="dialog-content">
        <p>Preferred currency</p>

        <p></p>
        <mwc-formfield label="Convert quotes in sessions also">
          <mwc-checkbox></mwc-checkbox>
        </mwc-formfield>
      </div>
      <div style="height:42px"></div>

      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>

    ${this.confirmDialog}
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