import { html, nothing } from "lit-html";
import { Aggregator } from "./profit-aggregator";
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

export const symbolsMap = {
  'EUR': '€',
  'USD': '$',
  'BTC': '₿',
  'ETH': 'Ξ',
  'USDT': '₮',
  'BNB': 'Ƀ'
}

export const precisionsMap = {
  'EUR': 2,
  'USD': 2,
  'ETH': 3,
  'BTC': 3
}

export function formatOutputPrice (value: number, quote: string, sign = false) {
  let symbol = symbolsMap[quote] || ` ${quote}`
  let precision = precisionsMap[quote] || 5

  return `${sign ? value > 0 ? '+ ' : '' : ''}${round(value, precision)}${symbol}`
}

export function outputPriceTemplate (value: number, quote: string, light = false) {
  const green = light ? '#00ff00' : '#4caf50';
  const red = light ? '#f44336' : '#ff0000'

  return html`
  <span style="color:${value === 0 ? 'initial' : value > 0 ? green : red};font-weight:500">${formatOutputPrice(value, quote, true)}</span>
  `
}


export function openVirtualInfoDialog () {
  window.textDialog.open('Virtual', html`
  <p>When Using Virtual</p>
  `)
}

export function formatOutputAggregation (aggregator: Aggregator) {
  return aggregator.units.map(agg => formatOutputPrice(agg[1], agg[0], false)).join(' + ')
}

export function aggregationTemplate (aggregator: Aggregator, light = false) {
  return html`
  <div>
  ${aggregator.units.map((agg, i) => {
    return html`${outputPriceTemplate(agg[1], agg[0], light)}
    ${i < aggregator.units.length - 1 ? html`<span> + </span>` : nothing }
    `
  })}
  </div>
  `
}