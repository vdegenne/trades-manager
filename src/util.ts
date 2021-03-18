import { TradeSession } from "./trades";

export function round(value: number, precision = 2) {
  return Math.round(value * (10**precision)) / (10**precision);
}

export function openCryptowatchLink (session: TradeSession) {
  window.open(
    `https://cryptowat.ch/charts/${session.exchange}:${session.symbol}-${session.quote}`,
    '_blank'
  )
}

export function breakLiteralPair (pair: string) {
  return {
    symbol: pair.split('-')[0],
    quote: pair.split('-')[1]
  }
}

export function sortAlphabetically (array: string[]) {
  return array.sort((a, b) => {
    if (a < b) { return -1 }
    if (a > b) { return 1 }
    return 0
  })
}


export function firstLetterUpperCase(text?: string) {
  if (!text) return undefined
  return text[0].toUpperCase() + text.slice(1)
}

export function formatQuote (quote: string) {
  switch (quote.toLowerCase()) {
    case 'eur':
      return '€'
    case 'usd':
      return '$'
    default:
      return ` ${quote}`
  }
}