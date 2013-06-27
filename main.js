var  settings = require('./settings.js')
    ,firmata = require('./firmata-utils')
    ,dram = require('dgram');

var udp_client = dgram.createSocket('udp4');

function write_udp(pin, value) {
    var key = pin.alias || pin.pin;
    var msg = new Buffer('<'+settings.prefix+':'+key+':'+value+'>');
    udp_client.send(msg, 0, msg.length, settings.port, settings.ip);
}

var board = new firmata.Board(settings.serial, function() {

    settings.watch.forEach(function(watch) {
        
        board.pinMode(watch.pin, firmata.MODES.INPUT);

        if(watch.type == firmata.DIGITAL) {
            var func = board.digitalDebounced;
        } else if(watch.type == firmata.ANALOG) {
            var func = board.analogRead;
        }

        func(watch.pin, function(value) {
            write_udp(watch, value);
        });
    });
});
