var  settings = require('./settings.js')
    ,firmata = require('./firmata-utils')
    ,dgram = require('dgram');

var udp_client = dgram.createSocket('udp4');

udp_client.bind(settings.port, '255.255.255.255', function() {
    udp_client.setBroadcast(true);
});

var changelog = {};
var reInitMessage = new RegExp(settings.prefix+',(\\d+),init,1');

function sendBroadcastMessage(id, key, value) {
    var msg = new Buffer([settings.prefix, id, key, value].join());
    udp_client.send(msg, 0, msg.length, settings.port, '255.255.255.255');
}

var board = new firmata.Board(settings.serial, function() {

    settings.watch.forEach(function(watch) {
 
        board.pinMode(watch.pin, board.MODES.INPUT);

        var key = watch.alias || watch.pin;

        if(watch.type == firmata.DIGITAL) {
            var func = function(pin, cb) {
                board.digitalDebounced(pin, cb);
            };
        } else if(watch.type == firmata.ANALOG) {
            var func = function(pin, cb) {
                board.analogRead(pin, cb);
            };
        }

        func(watch.pin, function(value) {
            if(!changelog[key] || changelog[key] != value) {
                sendBroadcastMessage(0, key, value);
            }
            changelog[key] = value;
        });
    });
});

// Send last state if init message is received to sending client
udp_client.on('message', function(msg, info) {
    var m = msg.toString().match(reInitMessage);
    if(m){
        var id = m[1];
        Object.keys(changelog).forEach(function(key) {
            var val = changelog[key];
            sendBroadcastMessage(id, key, val);
        });
    }
});
