export function round(value: number, precision = 2) {
  return Math.round(value * (10**precision)) / (10**precision);
}

export function openCryptowatchLink (cryptoName: string) {
  window.open(
    `https://cryptowat.ch/charts/KRAKEN:${cryptoName}-EUR`,
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