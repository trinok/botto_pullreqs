const needle = require('needle');
const cheerio = require('cheerio');
const parser = require('url')
const qs = require('querystring')
const _ = require('lodash');
const config = require('../config.js').url
const parsers = {}
const fs = require('fs')

;(() => {
  fs.readdir('./observers/parsers', (err, files) => {
    files = _.filter(files, (f) => f.slice(-3) === '.js')
    _.forEach(files, (f) => {
      // delete from cache so parsers get reloaded when this module is reloaded 
      delete require.cache[require.resolve('./parsers/'+f)]
      let matcher = require('./parsers/'+f).hostMatch
      parsers[f] = matcher
    })
    console.log(`Loaded URL cache with ${files.length} parsers`)
  })
})()

module.exports = {

  call: async function(opts, respond) {
    var match = opts.text.match(regex);

    if (match) {
      const url = parser.parse(match[0].trim())
      if (!url.hostname) { url.hostname = url.href } // hacky but whatever

      if (module.exports.isImage(url.href)) {
        return;
      }

      const pageParser = module.exports.hasOwnParser(url)

      if (pageParser) {
        const p = require('./parsers/'+pageParser)
        try {
          let info = await p.parse(url)
          respond(info)
        } catch (e) {
          console.log(`Error in parser: ${pageParser}\n  ${e.message}`)
          module.exports.parsePage(url.href, opts, (info) => respond(info))
        }
      } else {
        module.exports.parsePage(url.href, opts, (info) => respond(info))
      }
    }
  },

  hasOwnParser: function(url) {
    let parserFile = false
    _.forEach(parsers, (v, k) => {
      if (v.test(url.hostname)) {
        console.log(`Using ${k} parser for ${url.hostname}`)
        parserFile = k
      }
    })
    return parserFile
  },

  isImage: function(url) {
    const ignorable = ['jpg', 'png', 'gif', 'webm', 'jpeg', 'mp3', 'mp4']
    const ending = _.last(url.split('.'))
    if (ignorable.indexOf(ending) > -1) { 
      return true
    }
    return false
  },

  parsePage: function(url, opts, cb) {
    needle.get(url, config.options, function(err, response) {
      if (err) {
        return console.log(err);
      } else {
        const title = module.exports.parseTitle(response.body)
        if (!title) {
          console.log(`No title found in response body for ${url}`)
          return
        } else {
          cb(`[URL] ${title}`)
        }
      }
    });
  },

  parseTitle: function(html) {
    const $ = cheerio.load(html)
    let title = $('meta[property="og:title"]').attr('content')
    if (!title) {
      console.log('No meta property found for title. Using html property')
      title = $('head > title').text()
    }
    title = _.truncate(title, {length: 120}).trim()
    title = title.replace(/[\r\n\t]/g, " ")
    return title
  }
};

// Regex to find all URLs. Works with/without HTTP(S) and even without a TLD.
var expression = /[-a-zA-Z@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
var regex = new RegExp(expression);
