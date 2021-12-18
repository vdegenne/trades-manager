import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { percentColor, round } from './util';
import { styleMap } from 'lit/directives/style-map.js';

export const changeTagsList: ChangeTag[] = []

@customElement('change-tag')
export class ChangeTag extends LitElement {

  @property()
  private symbol?: string;

  @property()
  private quote?: string;

  private _change?: number;

  constructor() {
    super()

    changeTagsList.push(this)
  }

  static styles = css`
  :host {
    margin-left:8px;
    padding: 1px 4px;
    color: white;
  }
  `

  render() {

    if (this.symbol === undefined || this.quote === undefined) { return nothing }

    this._change = window.ChangesManager.getPairChange(this.symbol, this.quote)
    if (this._change === undefined) return nothing;

    this.style.backgroundColor = percentColor(this._change)
    // const style = styleMap({
    //   backgroundColor: percentColor(this._change)
    // })

    // console.log(html`${style}`)
    // this.setAttribute('style', style);

    return html`${round(this._change)}%`
  }
}