const fetch = require('node-fetch')
const fs = require('fs')

async function main () {
  buildBinancePairs()
  buildKrakenPairs()
}

async function buildBinancePairs () {
  const response = await fetch(`https://www.binance.com/api/v3/exchangeInfo`)
  const data = await response.json()

  fs.writeFileSync('src/binance/binance-pairs.json',
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


main()