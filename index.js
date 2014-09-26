var Device = require('./lib/device')
    , util = require('util')
    , stream = require('stream')
    , configHandlers = require('./lib/config-handlers');

// Give our driver a stream interface
util.inherits(yeelightDriver, stream);

// Our greeting to the user.
var SETUP_ANNOUNCEMENT = {
    "contents": [
        { "type": "heading", "text": "ninja-yeelight Driver Loaded" },
        { "type": "paragraph", "text": "The ninja-yeelight driver for Yeelight Sunflower bulbs has been loaded. To setup, click on 'Drivers' then the 'Configure' button next to Ninja Yeelight." }
    ]
};

/**
 * Called when Ninja client starts up (not the driver, the client)
 * @constructor
 *
 * @param  {Object} opts Saved/default driver configuration
 * @param  {Object} app  The app event emitter
 * @param  {String} app.id The client serial number
 *
 * @property  {Function} save When called will save the contents of `opts`
 * @property  {Function} config Will be called when config data is received from the Ninja Platform
 *
 * @fires register - Emit this when you wish to register a device (see Device)
 * @fires config - Emit this when you wish to send config data back to the Ninja Platform
 */
function yeelightDriver(opts, app) {

    var self = this;

    // ** save opts into this so it can be accessed by other functions (works, but is there a better way?)
    this.opts = opts;

    app.on('client::up', function () {

        // The client is now connected to the Ninja Platform

        // Check if we have sent a setup announcement before.
        // If not, send one and save the fact that we have.
        if (!opts.hasSentAnnouncement) {
            self.emit('announcement', SETUP_ANNOUNCEMENT);
            opts.hasSentAnnouncement = true;
//            opts.test = 'testing saving an opts member';
            self.save();
        }

        // Register a device
        self.emit('register', new Device());
    });
};

/**
 * Called when a user prompts a configuration.
 * If `rpc` is null, the user is asking for a menu of actions
 * This menu should have rpc_methods attached to them
 *
 * @param  {Object}   rpc     RPC Object
 * @param  {String}   rpc.method The method from the last payload
 * @param  {Object}   rpc.params Any input data the user provided
 * @param  {Function} cb      Used to match up requests.
 */
yeelightDriver.prototype.config = function (rpc, cb) {

    var self = this;
    // If rpc is null, we should send the user a menu of what he/she
    // can do.
    // Otherwise, we will try action the rpc method
    if (!rpc) {
        return configHandlers.menu.call(this, cb);
    }
    else if (typeof configHandlers[rpc.method] === "function") {
        return configHandlers[rpc.method].call(this, rpc.params, cb);
    }
    else {
        return cb(true);
    }
};


// Export it
module.exports = yeelightDriver;