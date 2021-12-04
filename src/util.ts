import { html, nothing } from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import { Aggregator } from "./profit-aggregator";
import { SessionSummary, TradeSession } from "./TradesManager";

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

  return `${sign ? value > 0 ? '+' : '' : ''}${round(value, precision)}${symbol}`
}

export function outputPriceTemplate (value: number, quote: string, light = false) {
  const green = light ? '#3adc41' : 'var(--green)';
  const red = light ? '#f44336' : '#ff0000'

  return html`
  <span style="font-weight:bold;color:${value === 0 ? 'var(--main-text-color)' : (value > 0 ? green : red)};font-weight:500">${formatOutputPrice(value, quote, true)}</span>
  `
}

export function percentTemplate (summary: SessionSummary) {
  const percent = summary.percent!;
  let backgroundColor = 'grey', color, text = `${round(percent) || '0'}%`;
  if (percent) {
    if (percent === -100 && summary.volume === 0) {
      text = '$$$'
      backgroundColor = '#ffeb3b'
    }
    else if (percent > 0) backgroundColor = 'var(--green)'
    else if (percent < -12) backgroundColor = '#971212'
    else backgroundColor = 'red'

    if (percent === -100 && summary.volume === 0) color = 'black'
    else if (percent <= 0) color = 'white'
    else color = 'var(--text-on-background-color, white)'
  }
  const styles = styleMap({
    backgroundColor,
    color
  })
  return html`
  <span class="percent" style=${styles}>${text}</span>
        <!-- style="background-color:${!percent ? 'grey' : percent > 0 ? 'var(--green)' : (percent < -12 ? '#971212' : 'red')};color:var(--text-on-background-color, white)">${round(percent, 2) || '0'}%</span> -->
  `
}


export function openVirtualInfoDialog () {
  window.textDialog.open('Virtual Sessions', html`
  <p>A virtual session is like a normal session but the trades inside are not used in the calculation of the total balance.<br>
  Virtual sessions are faded on the main UI so you can distinguish them from the normal ones.</p>
  <p><span>In short</span>: Use a virtual session when you want to experiment a pair or if you want to archive your profits.</p>
  <p><span>Note</span>: After you create a session you can always toggle this feature on and off from the trades interface (by clicking on the session strip)</p>
  `, 'I got it')
}


export function openChart(session: TradeSession) {
  if (session.exchange === 'binance') {
    window.open(`https://www.binance.com/en/trade/${session.symbol}_${session.quote}`, '_blank')
  }
}