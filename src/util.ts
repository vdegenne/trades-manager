export function round(value: number, precision = 2) {
  return Math.round(value * (10**precision)) / (10**precision);
}

export function openCryptowatchLink (cryptoName: string) {
  window.open(
    `https://cryptowat.ch/charts/KRAKEN:${cryptoName}-EUR`,
    '_blank'
  )
}