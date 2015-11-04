# Botto

A social IRC bot built on node.js

# Usage

1. Clone this repo

2. Edit `config.js` according to `example.config.js` in the root directory

3. Launch your botto with `node botto.js`

# Design

Botto uses 2 types of listeners when responding to events: commands and observers.
the `_commandHandler` and `_observerHandler` both act as routing layers to call
their respective modules. The modules themselves contain the logic for whatever the
module is responsible for. This allows us to easily add/remove/hot-swap modules
without having to mess with the routing layer since the modules are pulled in
dynamically on message events.

Both commands & observers should export a function that takes an options hash and
a callback. The callback will *always* echo the supplied value to the receiver
(be it a channel, private message, etc). For an better understanding, check out
the [observerHandler class](./observers/_observerHandler.js).

### Commands
Commands are explicit commands that start with the !bang syntax and are all listed
under the [commands](./commands) directory. Command modules prefixed with an `_`
underscore are considered "internal" commands and are not exposed to non-admin users.

### Observers
Observers are triggered when an observable event happens (a keyword or nickname is
mentioned, for example). All observer modules are passed the `opts` option hash which,
among other things, contains the message text. In the `module.exports` of each observer,
there should be logic that checks `opts.text` (most likely regex) and if criteria
are met, then the supplied callback should be called with an ultimate return value.
Below is a contrived example:

```
module.exports = function(opts, cb) {
  asyncFunction(input, function(error, success) {
      //some async work here...
      if (error) {
        cb(error.message)
      } else {
        cb(success.message);
      }
    });
};
```
