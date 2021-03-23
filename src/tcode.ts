import { AvailableExchanges, ExchangesManager } from "./ExchangesManager"

export type TCode = {
  exchange: AvailableExchanges;
  symbol: string;
  quote: string;
  type: 'buy'|'sell';
  price: number;
  quantity: number;
  fees?: number;
}

/**
 * Throws errors if the tcode is incorrect. Use the error message to provide
 * a feedback for the interface.
 * You can pass a tcode string or a TCode object.
 * The function returns the TCode object if no errors were found.
 * A TCode object can be partial, that means you also have to call `isTCodeComplete`
 * to make sure all the properties are present in the object for the validation to be complete.
 */
export function validateTCode (tcode: string|Partial<TCode>|undefined) {
  if (typeof tcode === 'string') {
    if (tcode.split(':').length > 7) {
      throw new Error('Invalid tcode (length)')
    }
    tcode = resolveTCode(tcode)
  }
  if (tcode === undefined) {
    throw new Error('Invalid tcode (not defined)')
  }

  // should check if the exchange exists
  if ('exchange' in tcode) {
    if (!Object.keys(ExchangesManager.exchanges).includes(tcode.exchange!)) {
      throw new Error('The exchange doesn\'t exist')
    }
  }
  const exchange = ExchangesManager.exchanges[tcode.exchange!]
  // does the symbol exists in the exchange ?
  if ('symbol' in tcode) {
    if (!exchange.getAvailableSymbols().includes(tcode.symbol!)) {
      throw new Error('The symbol is not available in this exchange')
    }
  }
  // does the quote exists in the exchange ?
  if ('quote' in tcode) {
    if (!ExchangesManager.exchanges[tcode.exchange!].getAvailableQuotesFromSymbol(tcode.symbol!).includes(tcode.quote!)) {
      throw new Error('The quote is not available for this symbol')
    }
  }
  // check if the type is correct
  if ('type' in tcode) {
    if (tcode.type !== 'buy' && tcode.type !== 'sell') {
      throw new Error('The type should be either \'buy\' or \'sell\'')
    }
  }
  // check if there are the right type
  if ('price' in tcode) {
    if (isNaN(tcode.price!)) {
      throw new Error('The price should be a number')
    }
  }
  if ('quantity' in tcode) {
    if (isNaN(tcode.quantity!)) {
      throw new Error('The quantity should be a number')
    }
  }
  if ('fees' in tcode) {
    if (isNaN(tcode.fees!)) {
      throw new Error('The fees should be a number')
    }
  }
  return tcode
}

export function resolveTCode (tcode: string) {
  const parts = tcode.split(':')
  // if (parts.length < 6) { parts.pop() }
  if (parts[parts.length - 1] === '') { parts.pop() }
  if (parts.length === 0) {
    return {}
  }
  const props = ['exchange', 'symbol', 'quote', 'type', 'price', 'quantity', 'fees']
  const tcodeObject = Object.fromEntries(parts.map((p: string, i) => {
    const prop = props[i]
    let value: string|number = p;
    if (prop === 'exchange') {
      value = p.toLowerCase()
    }
    if (prop === 'symbol' || prop === 'quote') {
      value = p.toUpperCase()
    }
    if (prop === 'type') {
      if (p === 'b') { value = 'buy'}
      if (p === 's') { value = 'sell' }
    }
    if (prop === 'price' || prop === 'quantity' || prop === 'fees') {
      value = parseFloat(p)
    }
    return [props[i], value]
  }))
  return tcodeObject as Partial<TCode>;
}

export function isTCodeComplete (tcode: TCode|Partial<TCode>) {
  return ('exchange' in tcode && 'symbol' in tcode && 'quote' in tcode && 'type' in tcode && 'price' in tcode && 'quantity' in tcode)
}