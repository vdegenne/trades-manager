const fetch = require('node-fetch')
const fs = require('fs')

async function main () {
  await buildBinancePairs()
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

main()