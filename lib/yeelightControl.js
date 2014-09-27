/**
 * Yeelight control using node.js (for Ninja Blocks system... part of the driver)
 * Created by Lindsay Ward on 20/09/2014.
 *
 * Yeelight API: http://www.yeelight.com/download/Yeelight_Sunflower_GW_API_v1.0.pdf
 * (Note mistake in brightness, should be 0-100, not 0-255
 *
 * Yeelight bridge responds to commands like:
 * "C 3CB8,0,255,255,0,\r\n" // change colour of light with id 3CB8 to RGB (cyan), brightness 0
 * "GL\r\n" // get all lights
 */
var net = require('net');

exports.sendCommand = function (command, ip, cb) {
//    command = "GL\r\n";
//    ip = '192.168.1.10';
    console.log("Sending: " + command);

    var client = net.createConnection(10003, ip);
    var completeData = '';

    // Yeelight doesn't send an end event;
    // Most data responses are one packet/event, but GLB response is in multiple packets / data events
    // so we need to end the connection after an amount of time
    client.setTimeout(20, function () {
        client.emit('end');
    });

    client.on("connect", function () {
        // connected to TCP server (Yeelight bridge). Send command.
        client.write(command);
    });

    client.on("data", function (data) {
        // append response to existing response(s)
        completeData += data.toString();
//        client.destroy();
    });

    client.on("end", function () {
        // Close the client socket completely
        client.destroy();
        // call the callback function, passing it the full response received from the bridge
        cb(completeData);
    });

}

/**
 * Process the "GLB ..." string (list of lights) returned by the bridge and store them in an array of Light objects
 * @param response
 * @returns {Array} array of Light objects
 */
exports.getLightsFromString = function (response) {
    var lights = [];
//var response = "GLB 0001,1,1,58,255,0,255,0,0;143E,1,1,50,199,97,255,0,0;287B,1,1,16,255,255,255,0,0;3CB8,1,1,53,0,255,255,100,0;50F5,1,1,61,255,255,255,0,0;6532,1,1,86,217,46,255,0,0;50F6,1,1,61,255,255,255,0,0;143F,1,1,11,255,255,255,0,0;";
//var response = completeData;

//    console.log("response in process: " + response);
    if (!response || !(response.slice(0, 3) === "GLB")) {
        console.log("Error");
    }
    else {
        // strip the "GLB " from the start and ";\r\n" from the end before splitting into just the light parts
        var parts = response.slice(4, response.length - 3).split(';');

        for (var i = 0; i < parts.length; i++) {
            var values = parts[i].split(',');
            var id = values[0]; // the only non-number value - keep as string
            values = values.map(Number);
//        console.log(values);
            lights.push(new Light(id, values[1], values[2], values[3], values[4], values[5], values[6], values[7], values[8]));
        }
    }

    return lights;
}

/**
 * Light object/function for storing light details with all parameters
 * @param id
 * @param type
 * @param online
 * @param lqi
 * @param r
 * @param g
 * @param b
 * @param level
 * @param effect
 * @constructor
 */
// ** might need to export this too
function Light(id, type, online, lqi, r, g, b, level, effect) {
    this.id = id; // HEX
    this.type = type; // 0 or 1
    this.online = online; // 0 or 1
    this.lqi = lqi; // LED ZigBee signal, 0-100  *I think
    this.r = r; // 0-255...
    this.g = g;
    this.b = b;
    this.level = level; // 0-100
    this.effect = effect; // note: reserved/not implemented by Yeelight yet
}

// testing:

//sendCommand("GL\r\n", '192.168.1.10', function (result) {
//    var lights = getLightsFromString(result)
//    console.log("Found " + lights.length + " lights: ");
//    console.log(lights);
//
//});
//sendCommand("HB\r\n", '192.168.1.10', function () {});
//console.log("out: " + result);
//sendCommand("GL\r\n", '192.168.1.10', function (result) { console.log("and..." + result)});

//var result = sendCommand("GL\r\n", '192.168.1.10', function () { });
//console.log("Result: " + result + "!");
//var lights = getLightsFromString(result);

//console.log("Found " + lights.length + " lights: ");
//console.log(lights);

