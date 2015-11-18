var config = require('./config.js').core;
var fs = require('fs');
var irc = require('irc');
var commandHandler = require('./commands/_commandHandler.js');
var observerHandler = require('./observers/_observerHandler.js')

/*
 * Initiate the bot and the observers
 */
var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

// Register all our message listeners (either observers or commands)
bot.addListener("message", function(from, to, text, msg) {

  try {
    // Delegate explicit commands starting with a !bang to the handler
  	commandHandler(bot, from, to, text, msg);
  	// Delegate observables (keywords, mentions, etc) to the handler
  	observerHandler(bot, from, to, text, msg);
  } catch (e) {
    console.error(e);
  }

});

if (config.debug) {
	bot.addListener("message", function(from, to, text, message) {
		console.log("[" + to + "] " + from + ": " + text);
	});

	bot.addListener("error", function(error) {
		console.log("[ERROR] ", error);
	});
}
