var configMessages = require('./config-messages')
    , yeelightControl = require('./yeelightControl.js');

// TODO: Currently, setting up clears all lights and names. Should be able to just update changes. Maybe add a reset (like this)
// TODO: Currently, configuring more than once leads to duplicate/repeated fields in popups. I don't know how to do this better yet.


/**
 * Called from the driver's config method when a
 * user wants to see a menu to configure the driver
 * @param  {Function} cb Callback to send a response back to the user
 */
exports.menu = function (cb) {
    var self = this;
    var messages = configMessages.menu;
    messages.contents[2].value = self.opts.bridgeIp;
    cb(null, messages);
};

/**
 * Called when a user clicks the Set IP button (from menu)
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.setup = function (params, cb) {

    var self = this;
    var messages = configMessages.setup;
    var lights = [];
    var ip = params.bridge_ip_text;

    // now that we have IP address of bridge, get light details to store
    yeelightControl.sendCommand(yeelightControl.COMMANDS.GET_LIGHTS, ip, function (result) {

        if (result === "") {
            messages.contents[1].text = "ERROR. No bridge found at " + ip;
            messages.contents.push({ "type": "submit", "name": "Back to Setup", "rpc_method": "menu" }); // ** ?? return configHandlers.menu.call(this, cb);
        }
        else {
            lights = yeelightControl.getLightsFromString(result);
            console.log("Found " + lights.length + " lights.");
//        console.log(lights);

            // using index 1 for message body, so ensure this is valid in future code updates
            messages.contents[1].text = "Success. Yeelight bridge found at " + ip + " with " + lights.length + " lights.";
            messages.contents.push({ "type": "submit", "name": "Name Lights", "rpc_method": "nameLights" });
        }
        // ** ? here? our outside with lights, somehow? - can't get lights out (asynchronous)
        // save bridge IP address into the opts object and save that to config file
        self.opts.bridgeIp = ip; // ** is there a better way to access options here? (this works because we saved opts into 'this' earlier at start of driver in index.js)

        // get just the light IDs from the light objects - and save this with space for names (blank)
        var lightBasics = [];
        for (var i = 0; i < lights.length; i++) {
            lightBasics.push({ 'id': lights[i].id, 'name': "" });
        }
        self.opts.lights = lightBasics;
        self.save();

        cb(null, messages);

    });
};

/**
 * Called when a user clicks the Name Lights button (from menu or setup)
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.nameLights = function (params, cb) {
    var self = this;
    var messages = configMessages.nameLights;
    var lights = self.opts.lights;

    for (var i = 0; i < lights.length; i++) {
        messages.contents.push({ "type": "input_field_text", "field_name": "lightID" + i, "value": lights[i].name, "label": "Light Name for " + lights[i].id, "placeholder": lights[i].id, "required": false });
    }
    messages.contents.push({ "type": "submit", "name": "Save", "rpc_method": "saveLightNames" });
    messages.contents.push({ "type": "close", "name": "Cancel" });
    return cb(null, messages);
};

/**
 * Called when a user clicks the Save button when naming lights
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.saveLightNames = function (params, cb) {
    var self = this;
    var messages = configMessages.saveLightNames;

    for (var i = 0; i < self.opts.lights.length; i++) {
        self.opts.lights[i].name = eval("params.lightID" + i); // uses eval to get dynamic variable name created when generating field names earlier
    }
    self.save();
    return cb(null, messages);
};

/**
 * Discover the IP address of the Yeelight bridge using UDP broadcast message
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user for when discovery is completed (successfully or not)
 */
exports.discover = function (params, cb) {

    var HOST = '239.255.255.250';
    var PORT = 1900;
    var dgram = require('dgram');
    var message = new Buffer(yeelightControl.COMMANDS.DISCOVER);
    var client = dgram.createSocket('udp4');

    var messages = configMessages.discovered;

    // set a timeout in case we get no response to UDP search message
    var timeout = setTimeout(function () {
        client.close();
        console.log("ERROR. Finished waiting. Bridge not found.");
        messages.contents[0].text = "ERROR. Bridge NOT found.";
        return cb(null, messages);
    }, 1000);

    client.on('message', function (message, remote) {
        // cancel setTimeout function and close socket since we've found the bridge
        clearTimeout(timeout);
        client.close();
//        console.log(remote.address + ':' + remote.port + ' - ' + message);

        // convert message buffer to a string (response) and extract IP (after "LOCATION: ")
        var response = '' + message;
        var start = response.indexOf("LOCATION: ") + 10;
        var end = response.indexOf("\r\n", 122);
        var ip = response.slice(start, end);
        console.log("Bridge found at " + ip);
        messages.contents[0].text = "Success. Bridge found at the following IP address...";
        messages.contents[1].value = ip;

        return cb(null, messages);
    });

    client.send(message, 0, message.length, PORT, HOST, function (err, bytes) {
        if (err) throw err;
//        console.log('UDP message sent to ' + HOST + ':' + PORT);
//        console.log('message was: ' + message);
    });
};

