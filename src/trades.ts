export type KrakenTradeObject = {
  pair: string,
  type: 'buy' | 'sell',
  price: string,
  vol: string,
  fee: string,
  cost: string
}

// [ sell or buy, volume, price, fee]
export type TradeUnit = {
  t: 'b'|'s',
  v: number,
  p: number,
  f: number,
  c: number
}

// export type Trades = {
//   [pair: string]: TradeUnit[]
// }

export type Trade = {
  type: 'buy'|'sell',
  price: number,
  volume: number
}

export type Trades = {
  [pair: string]: Trade[]
}

export type TradesSummary = {
  profit: number,
  volume: number
}



export class TradeManager {
  private trades: Trades

  constructor(trades?: Trades) {
    this.trades = trades || {}
  }

  addTrade(asset: string, trade: Trade) {
    if (!(asset in this.trades)) {
      this.trades[asset] = []
    }
    this.trades[asset].push(trade)
  }

  deleteAsset(assetName: string) {
    delete this.trades[assetName]
    console.log(this.trades)
  }

  get assets () {
    return Object.keys(this.trades)
  }

  getAssetTrades (assetName: string) {
    return this.trades[assetName]
  }

  getSummarizedTrade (assetName: string) {
    if (!(assetName in this.trades)) {
      return undefined;
    }
    return summarizeTrades(this.trades[assetName])
  }

  toString () {
    return JSON.stringify(this.trades)
  }
}

// export function getTradesFromKrakenTradeObjects (tradeObjects: KrakenTradeObject[]) {
//   // const tradeObjects: KrakenTradeObject[] = krakenResponse.result.trades;
//   console.log(`number of trades: ${Object.keys(tradeObjects).length}`);
//   console.log(Object.values(tradeObjects).filter(o => o.pair === 'GNOEUR'));
//   const trades: Trades = {}
//   for (const o of Object.values<KrakenTradeObject>(tradeObjects)) {
//     let trade = trades[o.pair] ;
//     if (!trade) {
//       trade = trades[o.pair] = []
//     }

//     trade.push({
//       t: o.type === 'sell' ? 's': 'b',
//       v: parseFloat(o.vol),
//       p: parseFloat(o.price),
//       f: parseFloat(o.fee),
//       c: parseFloat(o.cost)
//     })
//   }
//   return trades
// }

export function summarizeTrades (trades: Trade[]) {
  return trades.reduce((acc, trade)  => {
    if (trade.type === 'buy') {
      acc.profit -= trade.price * trade.volume;
      acc.volume += trade.volume;
    }
    else {
      acc.profit += trade.price * trade.volume;
      acc.volume -= trade.volume;
    }
    return acc
  }, {
    profit: 0,
    volume: 0
  } as TradesSummary)
}

// export function reduceTrades(trades: Trades) {
//   return Object.fromEntries(
//     Object.entries(trades).map(([pair, units]) => {
//       return [pair, summarizeTradeUnits(units)]
//     })
//   )
// }