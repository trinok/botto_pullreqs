const fs = require('fs');
const Command = require('../command.js')
const CommandHandler = require('../_commandHandler.js')

/*
 * A module for reloading (other) modules. This will purge a named module
 * from the require cache and reload it from disk, effectively hotswapping
 * the updated code (or resetting state, if something gets really fucked up).
 */
module.exports = class Reload extends Command {

  constructor() {
    super('reload')
  }

  async call(bot, opts) {

    const moduleName = opts.args[0];
    let numReloaded = 0;

    try {
      if (await CommandHandler.reload(moduleName)) {
        console.log('its true')
        numReloaded++
      }
      
      // do the same static call for ObserverHandler 

      if (numReloaded > 0) {
        return bot.say(opts.to, "Reloaded " + moduleName + " (" + numReloaded + " total)");
      }
    } catch (e) {
      console.error(e);
      return bot.say(opts.to, e.message);
    }
  }
};
