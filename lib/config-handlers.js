var configMessages = require('./config-messages')
    , yeelightControls = require('./yeelightControl.js');

/**
 * Called from the driver's config method when a
 * user wants to see a menu to configure the driver
 * @param  {Function} cb Callback to send a response back to the user
 */
exports.menu = function (cb) {

    cb(null, configMessages.menu);
};

/**
 * Called when a user clicks the Set IP button we sent in the menu request
 * @param  {Object}   params Parameter object
 * @param  {Function} cb     Callback to send back to the user
 */
exports.setup = function (params, cb) {

    var self = this;
    var statusMessages = configMessages.setup;
    var lights = [];

    // now that we have IP address of bridge, get light details to store
    yeelightControls.sendCommand("GL\r\n", params.bridge_ip_text, function (result) {

        if (result === "") {
            statusMessages.contents[1].text = "Error. No bridge found at " + params.bridge_ip_text;
        }
        else {
            lights = yeelightControls.getLightsFromString(result)
            console.log("Found " + lights.length + " lights: ");
//        console.log(lights);

            // using index 1 for message body, so ensure this is valid in future code updates
            statusMessages.contents[1].text = "Success. Yeelight bridge found at " + params.bridge_ip_text + " with " + lights.length + " lights.";
        }
        // ** ? here? our outside with lights, somehow? - can't get lights out (asynchronous)
        // save bridge IP address into the opts object and save that to config file
        self.opts.bridgeIp = params.bridge_ip_text; // ** is there a better way to access options here? (this works because we saved opts into 'this' earlier at start of driver in index.js)

        // get just the light IDs from the light objects - and save this with space for names (blank)
        var lightBasics = [];
        for (var i = 0; i < lights.length; i++) {
            lightBasics.push({ 'id' : lights[i].id, 'name' : "" });
        }
        self.opts.lights = lightBasics;
        self.save();

        cb(null, statusMessages);

    });


};

/**
 *
 * @param array
 * @param toRemove - name of property that item to remove will contain (should be unique)
 */
function removeElement(array, toRemove) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].hasOwnProperty(toRemove)) {
            array.splice(i, 1);
            return;
        }
    }
}