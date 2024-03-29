import { AvailableExchanges, ExchangesManager } from "./ExchangesManager"
import { SessionStrip } from "./session-strip"

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

export type Trade = {
  type: 'buy'|'sell',
  price: number,
  volume: number,
  fees?: number,
  date?: number
}

export type Alert = {
  limit: '>'|'<',
  value: number,
  notified: boolean
}

export type TradeSession = {
  id: number,
  title?: string;
  exchange: AvailableExchanges,
  symbol: string,
  quote: string,
  trades: Trade[],
  virtual: boolean,
  alert?: Alert
}

export type TradesSummary = {
  invested: number,
  volume: number,
}
export type SessionSummary = {
  invested: number,
  volume: number,
  price: number|undefined,
  total: number|undefined,
  profit: number|undefined,
  percent: number|undefined,
}

export declare type ValueQuote = {
  value: number;
  quote: string;
}

declare global {
  interface Window {
    tradesManager: TradesManager;
    sessions: TradeSession[];
  }
}


export class TradesManager {
  public sessions: TradeSession[]

  constructor(tradeSessions?: TradeSession[]) {
    this.sessions = tradeSessions || []
    window.tradesManager = this;
    window.sessions = this.sessions
  }

  createSession (exchange: AvailableExchanges, symbol: string, quote: string, virtual = false, title?: string) {
    const session: TradeSession = {
      id: Date.now(),
      exchange,
      symbol,
      quote,
      trades: [],
      virtual
    }
    if (title) {
      session.title = title;
    }
    this.sessions.push(session)
    return session
  }

  public addSession (session: Partial<TradeSession>) {
    const s: Partial<TradeSession> = {
      id: Date.now(),
      trades: [],
      alert: { value: 0.5, limit: '>', notified: false },
      ...session
    }
    this.sessions.push(s as TradeSession)
    return s as TradeSession
  }

  addTrade(session: TradeSession, trade: Trade) {
    session.trades.push(trade)
  }

  deleteSession (session: TradeSession) {
    this.sessions.splice(this.sessions.indexOf(session), 1)
  }

  cloneSession (session: TradeSession) {
    const sessionIndex = this.sessions.indexOf(session)
    const cloned: TradeSession = JSON.parse(JSON.stringify(session))
    cloned.id = Date.now()
    this.sessions.splice(sessionIndex + 1, 0, cloned)
    return cloned;
  }

  deleteTrade (trade: Trade) {
    const session = this.getTradesSession(trade)!
    const indexOfTrade = session.trades.indexOf(trade)
    if (indexOfTrade === -1) return false

    session.trades.splice(indexOfTrade, 1)
    return true
  }

  deleteAllTrades (session: TradeSession) {
    session.trades = []
  }

  getTradesSession (trade: Trade) {
    return this.sessions.find(s => s.trades.indexOf(trade) >= 0)
  }

  getSessions (exchangeName: string, symbol: string, quote: string) {
    return this.sessions.filter(s => s.exchange === exchangeName && s.symbol === symbol && s.quote === quote)
  }

  getSessionFromId (id: number) {
    return this.sessions.find(s => s.id === id)
  }

  getPairTrades (pair: string) {
    return this.sessions[pair]
  }

  getSummarizedSessionTrades (session: TradeSession) {
    return summarizeSessionTrades(session)
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

export function summarizeSessionTrades (session: TradeSession) {
  return session.trades.reduce((acc, trade)  => {
    if (trade.type === 'buy') {
      acc.invested += trade.price * trade.volume;
      acc.volume += trade.volume;
    }
    else {
      acc.invested -= trade.price * trade.volume;
      acc.volume -= trade.volume;
    }
    return acc
  }, {
    invested: 0,
    volume: 0
  } as TradesSummary)
}
export const getSummary = summarizeSessionTrades; // alias

// export function reduceTrades(trades: Trades) {
//   return Object.fromEntries(
//     Object.entries(trades).map(([pair, units]) => {
//       return [pair, summarizeTradeUnits(units)]
//     })
//   )
// }

export function summarizeSession (session: TradeSession): SessionSummary {
  const summary = summarizeSessionTrades(session)
  const ssummary: Partial<SessionSummary> = {...summary}
  const price = ExchangesManager.getPrice(session.exchange, session.symbol, session.quote)
  if (price) {
    ssummary.price = price;
    ssummary.total = price * summary.volume;
    ssummary.profit = ssummary.total - summary.invested;
    // ssummary.percent = (ssummary.profit / summary.invested) * 100;
    ssummary.percent = (ssummary.profit * 100) / summary.invested;
  }

  return ssummary as SessionSummary;
}
export const getSessionSummary = summarizeSession;