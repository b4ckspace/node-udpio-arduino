var  settings = require('./settings.js')
    ,firmata = require('./firmata-utils')
    ,dgram = require('dgram')
    ,winston = require('winston');


var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true
        })
    ]
});


var udp_client = dgram.createSocket('udp4');

logger.info('Binding to 255.255.255.255:'+settings.port);
udp_client.bind(settings.port, '255.255.255.255', function() {
    logger.info('Port bound, setting broadcast mode');
    udp_client.setBroadcast(true);
});

var changelog = {};
var reInitMessage = new RegExp(settings.prefix+',(\\d+),init,1');

function sendBroadcastMessage(id, key, value) {
    var msg = new Buffer([settings.prefix, id, key, value].join());
    logger.info('sending pinchange '+key+' to '+value+' on channel '+id);
    udp_client.send(msg, 0, msg.length, settings.port, '255.255.255.255');
}

var board = new firmata.Board(settings.serial, function() {

    logger.info('Connected to arduino on '+settings.serial);

    settings.watch.forEach(function(watch) {
 
        board.pinMode(watch.pin, board.MODES.INPUT);

        var key = watch.alias || watch.pin;

        if(watch.type == firmata.DIGITAL) {
            var func = function(pin, cb) {
                var sensivity = watch.sensivity || settings.sensivity;
                board.digitalDebounced(pin, cb, sensivity);
            };

            logger.info('Setting up watch on digital pin '+pin+' -> '+key);
        } else if(watch.type == firmata.ANALOG) {
            var func = function(pin, cb) {
                board.analogRead(pin, cb);
            };

            logger.info('Setting up watch on analog pin '+pin+' -> '+key);
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
        logger.info('received init from '+id);
        Object.keys(changelog).forEach(function(key) {
            var val = changelog[key];
            sendBroadcastMessage(id, key, val);
        });
    }
});
