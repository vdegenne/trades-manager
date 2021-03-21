const exchanges = {
  kraken: new Object,
  binance: new Object,
  others: new Object
}

declare type AvailableExchanges = keyof typeof exchanges;

declare type WalletsData = {
  [key in AvailableExchanges]: []
}

let wallets: WalletsData
wallets = Object.fromEntries(Object.keys(exchanges).map(exchange => {
  return [exchange, []]
}))