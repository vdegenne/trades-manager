import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Aggregator } from './profit-aggregator';
import { SessionStrip } from './session-strip';

@customElement('total-strip')
export class TotalStrip extends LitElement {

  exchange?: string;

  @property()
  private aggregator?: Aggregator;

  static styles = [
    css`
    :host {
      display: block;
      background-color: #bdbdbd;
      min-height: 20px;
      padding: 6px;
      border-radius: 3px;
    }
    `
  ]

  render() {
    return html`
    ${this.aggregator?.toHtml()}
    `
  }

  public aggregateFromStrips (strips: SessionStrip[]) {
    const aggr = new Aggregator(strips[0].session.exchange)
    strips.forEach(s => {
      aggr.pushUnit(s.session.quote, s.summary!.profit!)
    })

    aggr.resolveQuotes(window.spacesManager.space.currency)
    this.aggregator = aggr;
  }
}