#!/usr/bin/node

const fetch = require('node-fetch')
const fs = require('fs')

async function main () {
  buildBinancePairs()
  buildKrakenPairs()
  buildCoingeckoPairs()
}

async function buildBinancePairs () {
  const response = await fetch(`https://www.binance.com/api/v3/exchangeInfo`)
  const data = await response.json()

  fs.writeFileSync('./docs/binance-pairs.json',
    JSON.stringify(
      data.symbols.map(s => ({
        s: s.baseAsset,
        q: s.quoteAsset
      }))
    )
  )
}

async function buildKrakenPairs () {
  const result = (await (await fetch(`https://api.kraken.com/0/public/AssetPairs`)).json()).result

  fs.writeFileSync('src/kraken/kraken-pairs.json',
    JSON.stringify(
      Object.entries(result)
      .filter(([id, obj]) => obj.wsname)
      .map(([id, obj]) => {
        const p = obj.wsname.split('/')
        return {
          id,
          s: p[0],
          q: p[1]
        }
      })
    )
  )
}

async function buildCoingeckoPairs () {
  // first we build the coin list
  let result = await (await fetch('https://api.coingecko.com/api/v3/coins/list')).json()

  fs.writeFileSync('src/coingecko/coingecko-symbols.json', JSON.stringify(
    result.map(o => ({
      id: o.id,
      s: o.symbol.toUpperCase()
    }))
  ))
  fs.writeFileSync('docs/coingecko-symbols.json', JSON.stringify(
    result.map(o => ({
      id: o.id,
      s: o.symbol.toUpperCase()
    }))
  ))

  // then the quotes
  result = await (await fetch('https://api.coingecko.com/api/v3/simple/supported_vs_currencies')).json()

  fs.writeFileSync('src/coingecko/coingecko-quotes.json', JSON.stringify(
    result.map(o => o.toUpperCase())
  ))
}


main()
