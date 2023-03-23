const needle = require('needle');
const config = require('../config').url
const API_KEY = require('../config').stock.apiKey
const BASE_URL = 'https://cloud.iexapis.com/stable/stock' 
const Command = require('./command.js')
const Colors = require('irc').colors
const Helpers = require('../util/helpers.js')

module.exports = class Stock extends Command {
  
  constructor() {
    super('stock')
  }

  async call(bot, opts, respond) {
    const ticker = opts.args[0]

    if (ticker === '') {
      return respond('Usage is !stock <ticker>')
    }

    const info = await this.stockInfo(ticker)
    return respond(info)
  }

  async stockInfo(ticker) {
    const API_URL = `${BASE_URL}/${ticker}/quote?token=${API_KEY}`
    const res = await needle('get', API_URL, config)

    if (res.statusCode == 404) {
      return `Unable to find price data for ticker $${ticker}`
    }

    const p = res.body
    const color = ( p.change >= 0 ? 'light_green' : 'light_red' )
    const price = Colors.wrap('yellow', `$${p.latestPrice}`)
    const changePercent = (p.changePercent * 100).toFixed(2)
    const vol = ( p.volume === null ? '' : ` | Vol: ${p.volume.toLocaleString()}` )
    const url = await Helpers.shortenUrl(`https://finance.yahoo.com/quote/${ticker}`)

    return `${p.companyName}: ${price}`
      + `${vol}`
      + ` | Change: ${Colors.wrap(color, p.change)} pts (${Colors.wrap(color, changePercent)}%)`
      + ` | ${url}`
  }

}
