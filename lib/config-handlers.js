var configMessages = require('./config-messages');

/**
 * Called from the driver's config method when a
 * user wants to see a menu to configure the driver
 * @param  {Function} cb Callback to send a response back to the user
 */
exports.menu = function (cb) {

    cb(null, configMessages.menu);
};

/**
 * Called when a user clicks the Set IP
 * button we sent in the menu request
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.setIp = function (params, cb) {

    var self = this;
//    var echoText = params.echoText;
    var payloadToSend = configMessages.setIp;

    payloadToSend.contents.push({ "type": "paragraph", "text": params.bridge_ip_text });
    payloadToSend.contents.push({ "type": "close", "name": "Close" });

    console.log(params);
    this.opts.bridgeIp = params.bridge_ip_text; // ** is there a better way to access options here? (this works because we saved opts into this earlier)
    self.save();

    cb(null, payloadToSend);
};