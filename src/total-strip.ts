import { css, html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Aggregator } from './profit-aggregator';
import { SessionStrip } from './session-strip';
import { percentTemplate } from './util';

@customElement('total-strip')
export class TotalStrip extends LitElement {

  exchange?: string;

  @property()
  private aggro?: Aggregator;

  @property()
  private investAggro?: Aggregator;

  @property()
  private percent?: number;

  static styles = [
    css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #fafafa;
      min-height: 20px;
      padding: 6px 9px;
      border-radius: 3px;
    }
    `
  ]

  render() {

    if (!this.aggro || !this.investAggro) {
      return nothing;
    }

    let percent!: number;

    if (this.aggro!.units.length === 1
      && this.aggro!.units[0][0] === window.spacesManager.space.currency
      && this.investAggro!.units.length === 1
      && this.investAggro!.units[0][0] === window.spacesManager.space.currency) {

        // Calculate the total percentage
        const totalInvested = this.investAggro.units[0][1]
        const totalProfit = this.aggro.units[0][1]
        percent = 100 * totalProfit / totalInvested;
    }

    return html`
    <span style="color:blue">${this.investAggro?.toString()}</span>

    ${this.aggro?.toHtml()}

    ${percent ? percentTemplate(percent) : nothing}
    `
  }

  public aggregateFromStrips (strips: SessionStrip[]) {
    const aggro = new Aggregator(strips[0].session.exchange)
    const iAggro = new Aggregator(strips[0].session.exchange) // Invested Aggregator

    strips.forEach(s => {
      /* Profit Aggro */
      if (s.hProfit) {
        aggro.pushUnit(s.hProfit.quote, s.hProfit.value)
      }
      else {
        aggro.pushUnit(s.session.quote, s.summary!.profit!)
      }

      /* Invested Aggro */
      if (s.hInvested) {
        iAggro.pushUnit(s.hInvested.quote, s.hInvested.value)
      }
      else {
        iAggro.pushUnit(s.session.quote, s.summary!.invested)
      }
    })

    // aggr.resolveQuotes(window.spacesManager.space.currency)
    // aggr.reduce()
    this.aggro = aggro;
    this.investAggro = iAggro;
  }
}