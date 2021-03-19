import {AvailableExchanges, ExchangesManager, Exchange} from './ExchangesManager'

export type AggregatorUnit = [string, number]
export type Aggregator = {
  [key in AvailableExchanges]: AggregatorUnit[]
};

export class ProfitAggregator {
  private aggregator: Aggregator;

  constructor() {
    // @ts-ignore
    this.aggregator = Object.fromEntries(Object.keys(ExchangesManager.exchanges).map(name => [name, []]));
  }

  pushUnit(exchangeName: AvailableExchanges, quote: string, profit: number) {
    // we should push the profit in the existing quote
    const unit = this.aggregator[exchangeName].find(unit => unit[0] === quote)
    if (unit) {
      unit[1] += profit;
      return
    }
    this.aggregator[exchangeName].push([quote, profit])
  }

  resolveQuotes () {
    const currency = window.app.currency
    for (const [exchangeName, units] of Object.entries(this.aggregator)) {
      for (const unit of units) {
        // if the quote is different from the current currency
        if (unit[0] !== currency) {
          // We should get the price for conversion.
          // Ideally the price should be the conversion of the quote in the current currency
          // but there are some case where a pair for conversion is not available on any exchange
          // in this case we should have a fallback where we convert the best conversion match returned
          // from the conversion method to the current currency calculated from the currency conversion
          // values imported from https://exchangeratesapi.io/.
        }
      }
    }
  }
}