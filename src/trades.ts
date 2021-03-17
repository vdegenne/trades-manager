import { AvailableExchanges, ExchangesManager } from "./ExchangesManager"

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
  symbol: string,
  quote: string,
  type: 'buy'|'sell',
  price: number,
  volume: number,
  fees?: number
}

export type TradeSession = {
  id: number,
  exchange: AvailableExchanges,
  symbol: string,
  quote: string,
  trades: Trade[]
}

export type TradesSummary = {
  profit: number,
  volume: number
}



export class TradeManager {
  public sessions: TradeSession[]

  constructor(tradeSessions?: TradeSession[]) {
    this.sessions = tradeSessions || []
  }

  createSession (exchange: AvailableExchanges, symbol: string, quote: string) {
    this.sessions.push({
      id: Date.now(),
      exchange,
      symbol,
      quote,
      trades: []
    })
  }

  addTrade(trade: Trade, session: TradeSession) {
    session.trades.push(trade)
  }

  getPairTrades (pair: string) {
    return this.sessions[pair]
  }

  getSummarizedTrade (pair: string) {
    if (!(pair in this.sessions)) {
      return undefined;
    }
    return summarizeTrades(this.sessions[pair])
  }

  toString () {
    return JSON.stringify(this.sessions)
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