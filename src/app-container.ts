import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
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
import { ImportExport } from './data/import-export';
import './data/import-export'
import './data/data-loader'
import { SessionAlert } from './session-alert'
import './notification-manager'

declare global {
  interface Window {
    app: AppContainer;
    appTitle: string;
    textDialog: TextDialog;
    confirmDialog: ConfirmDialog;
    tcodeInterface: TCodeInterface;
    importExportInterface: ImportExport;
    sessionAlert: SessionAlert;
    // For non-static website
    spacesInterface: {
      open: Function
    };
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
  private importExport: ImportExport;
  private sessionAlert: SessionAlert;

  private confirmDialog = new ConfirmDialog()

  @property({type:Object})
  private walletsManager: WalletsManager;

  @property({type:Boolean})
  private static = true;

  @query('mwc-snackbar') snackbar!: Snackbar;
  @query('mwc-dialog[heading=Options]') optionsDialog!: Dialog;
  @query('text-dialog') textDialog!: TextDialog;
  @query('about-dialog') aboutDialog!: AboutDialog;
  // @query('spaces-interface') spacesInterface!: any;

  constructor() {
    super()
    window.app = this
    window.appTitle = 'Tradon'
    window.confirmDialog = this.confirmDialog

    this.optionsInterface = new OptionsInterface()
    this.sessionsInterface = new SessionsInterface()
    this.tCodeInterface = new TCodeInterface()
    this.importExport = new ImportExport()
    this.sessionAlert = new SessionAlert()

    this.walletsManager = new WalletsManager() // deprecated ?

    window.tcodeInterface = this.tCodeInterface;
    window.importExportInterface = this.importExport;
    window.sessionAlert = this.sessionAlert;

    // we should check if the app is static or server side
    this.constructServerScript()
  }

  /**
   * This function is used to determine if the website is in static mode or not.
   * static means the site is loaded from a static context (e.g. github)
   * whereas non-static is when the site is loaded from the server.
   * When the site is loaded from the server we should give more feature to the user ($)
   */
  private constructServerScript () {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = './spaces-interface.js'
    script.onerror = () => {
      this.static = true;
    }
    script.onload = () => {
      this.static = false;
    }
    document.head.appendChild(script)
  }

  static styles = css`
  :host {
    display: block;
    /* --mdc-theme-primary: #004d40; */
    --mdc-theme-primary: #3e2723;
    max-width: 700px;
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
      <div style="display:flex;align-items:center;padding:4px 18px 4px 10px;border-radius:7px;background-color:#004d4017;flex:1">
        <img src="./images/logo.png" width="60px" height="60px" style="position:absolute"><span style="margin-left:66px;font-size:24px;font-weight:500;color:var(--mdc-theme-primary);font-family:serial">${window.appTitle}</span>
      </div>
      <div style="display:flex;align-items:center">
        <mwc-icon-button icon="title" @click="${() => this.tCodeInterface.open()}"></mwc-icon-button>
        <mwc-icon-button icon="space_dashboard" @click="${() => this.onSpaceButtonClick()}"></mwc-icon-button>
        <!-- <mwc-button outlined icon="space_dashboard" style="margin-right:6px"
          @click="${() => this.onSpaceButtonClick()}">${window.spacesManager.space?.name}</mwc-button> -->
        <!-- <mwc-icon-button icon="save" @click="${e => this.importExport.open()}"></mwc-icon-button> -->
        <!-- <mwc-icon-button icon="help_outline" @click="${() => this.aboutDialog.open()}"></mwc-icon-button> -->
        <mwc-icon-button icon="settings" @click="${() => this.optionsInterface.open()}"></mwc-icon-button>
      </div>
    </header>

    ${this.optionsInterface}

    ${window.spacesInterface}

    ${this.spacesManager}

    ${this.sessionsInterface}

    ${this.tCodeInterface}
    ${this.importExport}

    ${this.sessionAlert}

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

  private async onSpaceButtonClick() {
    if (this.static) {
      await window.textDialog.open('Static version', html`
      <p>You are using the static version of ${window.appTitle}, that means you can only <i>manually</i> import and export the default space between your devices.</p>
      <p>If you want to create more spaces and <i>automatically</i> synchronise your data across your device, please visit this link instead :</p>
      <p><b>coming soon</b></p>
      `, 'I got it')
      this.importExport.open()
    }
    else {
      // non-static we open the spaces feature
      window.spacesInterface.open()
    }
  }

  firstUpdated() {
    window.textDialog = this.textDialog;
  }

  toast (message: string) {
    this.snackbar.labelText = message;
    this.snackbar.show()
  }
}