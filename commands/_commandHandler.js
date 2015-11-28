var fs = require("fs");
var admin = require("../core/admin.js");
/*
 * Command handler responsible for routing commands. These include admin only
 * commands as well as any-user commands. Admin/internal functionality is denoted
 * as _file.js. This module is essentially a routing layer and should contain no
 * command logic other than delegation and some (light) parsing.
 */

 module.exports = function(bot, from, to, text, message) {

   // A cache for all our "private" commands (bot-admin or internal use only)
   var privateCommands = {}

   privateCommands.reload = function(bot, opts) {
     require("../core/reload.js").call(bot, opts);
   }

   privateCommands.irc = function(bot, opts) {
     require("../core/irc.js").call(bot, opts);
   }

   /*
    * Dynamically require and look up our triggers/commands, allowing for
    * hot-swapping of code if something in a module needs to be changed.
    */
   function publicCommands(opts) {
     if (fs.existsSync('./commands/' + opts.command + '.js')) {
       require('./' + opts.command).call(opts, function(response) {
         bot.say(receiver, response);
       });
     }
   }

   if (text && text[0] == '!') {
     var opts = makeOptions(bot, from, to, text, message);
     var receiver = to;

     if (typeof privateCommands[opts.command] === 'function') {
       if (admin.isAdmin(opts.from, opts.to)) {
        privateCommands[opts.command](bot, opts);
       }
     } else {
       publicCommands(opts);
     }
   }
 };

// Helper function to stuff params into an `opts` hash
 function makeOptions(bot, from, to, text, message) {
   var opts = {
     from: from,
     to: to,
     command: String(text.split(' ')[0]).replace('!', '').trim(),
     args: text.substring(String(text.split(' ')[0]).length).trim().split(' '),
     raw: message
   };

   return opts;
 }
