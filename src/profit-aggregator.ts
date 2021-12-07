import { html, nothing } from 'lit';
import { Currency } from './app-container';
import {AvailableExchanges, ExchangesManager, Exchange} from './ExchangesManager'
import { formatOutputPrice, outputPriceTemplate } from './util';

export type AggregatorUnit = [string, number]

export class Aggregator {
  public units: AggregatorUnit[];
  private exchangeName: AvailableExchanges;

  constructor(exchangeName: AvailableExchanges, units?: AggregatorUnit[]) {
    this.units = units || []
    this.exchangeName = exchangeName;
  }

  pushUnit(quote: string, value: number) {
    // we should push the profit in the existing quote
    const unit = this.units.find(unit => unit[0] === quote)
    if (unit) {
      unit[1] += value;
      return
    }
    this.units.push([quote, value])
  }

  resolveQuotes (currency: Currency) {
    for (const unit of this.units) {
      // if the quote is different from the current currency
      if (unit[0] !== currency) {
        // We should get the price for conversion.
        // Ideally the price should be the conversion of the quote in the current currency
        // but there are some case where a pair for conversion is not available on any exchange
        // in this case we should have a fallback where we convert the best conversion match returned
        // from the conversion method to the current currency calculated from the currency conversion
        // values imported from https://exchangeratesapi.io/.
        const pConversion = ExchangesManager.getConversionPrice(unit[0], currency, this.exchangeName as AvailableExchanges);
        if (pConversion && pConversion.quote === currency && pConversion.value !== undefined) {
          unit[0] = pConversion.quote
          unit[1] = pConversion.value * unit[1]
        }
        else {
          // @todo implement in case there is no available conversion from the exchange system
        }
      }
    }
    this.reduce()
  }

  reduce () {
    const reduceds: AggregatorUnit[] = []
    for (const unit of this.units) {
      const reduced = reduceds.find(r => r[0] === unit[0])
      if (reduced) {
        reduced[1] += unit[1]
      }
      else {
        reduceds.push([unit[0], unit[1]])
      }
    }
    this.units = reduceds
  }

  isEmpty () {
    return !this.units.length
  }

  clone () {
    const cloned: AggregatorUnit[] = []
    for (const unit of this.units) {
      cloned.push([unit[0], unit[1]])
    }
    return new Aggregator(this.exchangeName, cloned)
  }

  toHtml () {
    return html`
      <div>
      ${this.units.map((agg, i) => {
        return html`${outputPriceTemplate(agg[1], agg[0])}
        ${i < this.units.length - 1 ? html`<span> + </span>` : nothing }
        `
      })}
      </div>
      `
  }

  toString () {
    return formatOutputAggregation(this);
  }
}


export function formatOutputAggregation (aggregator: Aggregator) {
  return aggregator.units.map(agg => formatOutputPrice(agg[1], agg[0], false)).join(' + ')
}

export function aggregationTemplate (aggregator: Aggregator, light = false) {
}