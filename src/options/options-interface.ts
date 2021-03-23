import { customElement, html, LitElement, property } from "lit-element";
import { Options, OptionsManager } from "./options";


@customElement('options-interface')
export class OptionsInterface extends LitElement {
  @property()
  private optionsManager: OptionsManager;

  constructor (options?: Options) {
    super()
    window.optionsInterface = this

    this.optionsManager = new OptionsManager(options)
  }

  render () {
    return html`
    options not implemented yet
    `
  }
}

declare global {
  interface Window {
    optionsInterface: OptionsInterface;
    options: Options;
  }
}