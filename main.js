var  settings = require('./settings.js')
    ,firmata = require('./firmata-utils')
    ,dgram = require('dgram');

var udp_client = dgram.createSocket('udp4');
var changelog = {};

function write_udp(key, value, ip) {
    ip = ip || settings.ip;
    var msg = new Buffer('<'+settings.prefix+':'+key+':'+value+'>');
    udp_client.send(msg, 0, msg.length, settings.port, ip);
}

var board = new firmata.Board(settings.serial, function() {

    settings.watch.forEach(function(watch) {
        
        board.pinMode(watch.pin, firmata.MODES.INPUT);

        var key = watch.alias || watch.pin;

        if(watch.type == firmata.DIGITAL) {
            var func = board.digitalDebounced;
        } else if(watch.type == firmata.ANALOG) {
            var func = board.analogRead;
        }

        func(watch.pin, function(value) {
            changelog[key] = value;
            write_udp(key, value);
        });
    });
});

// Send last state if init message is received to sending client
udp_client.on('message', function(msg, info) {
    if(msg == '<'+settings.prefix+':init>') {
        this.changelog.forEach(function(val, key) {
            write_udp(key, val, info.address);
        });
    }
});
