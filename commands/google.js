var needle = require('needle');
var cheerio = require('cheerio');
var admins = require ('../core/admin.js');

module.exports = {

  call: function(opts, respond) {
    if (opts.args[0] == '') {
      respond("Usage is !google <query>");
    } else {
      query = opts.args.join('+');
      respond(module.exports.makeSearch(query, respond));
    }
  },

  makeSearch: function(query, respond) {
    needle.get(searchUrl+query, options, function(err, response) {
      if (err) {
        return respond("Error retrieving search results");
      } else {
        var results = module.exports.getSearchResults(response.body);
        respond("[Google] " + results[0].title + " - " + results[0].url);
      }
    });
  },

  getSearchResults: function(html) {
    try {
      var $ = cheerio.load(html);
      var results = [];
      $('.g').each(function(i, el) {

        var el = $(el);

        var row = {
          title: el.find('.r').text(),
          url: el.find('.r a').attr('href')
        };

        results.push(row);
        return;
      }.bind(this));

      return results;
    } catch (e) {
      console.error(e);
    }
  }

};

// Base google search URL
var searchUrl = "https://www.google.com/search?q="

// HTTP client options
var options = {
    follow: 3,
    open_timeout: 5000,
    headers: {
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
    }
  }
