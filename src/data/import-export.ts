import { LitElement, html, customElement, property, query, css } from 'lit-element';
import { nothing } from 'lit-html';
import '@material/mwc-textarea'
import { Dialog } from '@material/mwc-dialog';
import { TextArea } from '@material/mwc-textarea';
import clipboardCopy from 'clipboard-copy';
import '@material/mwc-tab-bar'

const type = ['export', 'import'] as const

@customElement('import-export')
export class ImportExport extends LitElement {
  @property()
  private type: typeof type[number] = 'export'

  @query('mwc-dialog') dialog!: Dialog;
  @query('mwc-textarea#export') exportTextArea!: TextArea;
  @query('mwc-textarea#import') importTextArea!: TextArea;

  static styles = [
    css`
    [hide] {
      display: none;
    }
    mwc-textarea {
      width: 100%;
    }
    `
  ]

  render () {
    return html`
    <mwc-dialog heading="Save">
      <div style="width:700px"></div>
      <div>
        <mwc-tab-bar @MDCTabBar:activated="${e => this.type = type[e.detail.index]}" style="margin-bottom:24px;">
          <mwc-tab label="export"></mwc-tab>
          <mwc-tab label="import"></mwc-tab>
        </mwc-tab-bar>

        <div ?hide="${this.type !== 'export'}" style="text-align:center">
          <mwc-textarea outlined id="export" disabled rows="12"></mwc-textarea>
          <p>Paste this code in your other devices to retrieve your data.</p>
          <mwc-button unelevated icon="content_copy"
            @click="${() => this.copyToClipboard()}">copy</mwc-button>
        </div>

        <div ?hide="${this.type !== 'import'}" style="text-align:center;">
          <mwc-textarea outlined id="import" rows="12"
            @keypress="${(e) => e.stopPropagation()}"
            @keyup="${() => this.requestUpdate()}"></mwc-textarea>
          <p>Paste your data in here and import to load your data from other devices.</p>
        </div>
      </div>

      ${this.type === 'import' ? html`
      <mwc-button unelevated slot="secondaryAction" icon="download"
          @click="${() => this.onImportClick()}" ?disabled="${!this.importTextArea.value}">import</mwc-button>
      ` : nothing }
      <mwc-button outlined slot="primaryAction" dialogAction="close">close</mwc-button>
    </mwc-dialog>
    `
  }

  private async onImportClick() {
    // we verify the object integrity
    // first we try to parse the json, if an error occurs the data structure itself is broken
    let data;
    try {
      data = JSON.parse(this.importTextArea.value)
    } catch (e) {
      window.app.toast('Incorrect data')
      return
    }
    // then we verify the integrity of the data (is the model coherent to the app?)
    try {
      window.dataLoader.verifyIntegrity(data);
    } catch (e) {
      window.app.toast(e.message) // report the error on the ui
      return;
    }

    // we ask user to confirm the override
    try {
      await window.confirmDialog.open('Continue ?', html`
      <p>This will erase the current state of the app and replace everything with the data you are importing.</p>
      `)
    } catch (e) { return /* canceled */ }

    // integrity passed we load the data and close the dialog
    window.dataLoader.loadData(data)
    this.dialog.close()
    window.app.toast('Imported successfully!')
  }

  private copyToClipboard() {
    clipboardCopy(this.exportTextArea.value)
    window.app.toast('copied to clipboard!')
  }

  open () {
    this.exportTextArea.value = JSON.stringify(window.dataLoader.getCurrentState())
    this.dialog.show()
  }
}
