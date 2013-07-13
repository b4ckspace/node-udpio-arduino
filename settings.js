var firmata = require('./firmata-utils');

module.exports = {
    serial: '/dev/ttyACM3',
    ip: '10.1.20.255',
    port: 5042,
    prefix: 'AIO0',
    sensivity: 100,
    watch: [
        { type: firmata.DIGITAL, pin: 13, alias: 'doorframe'},
        { type: firmata.DIGITAL, pin: 12, alias: 'doorlock' },
        { type: firmata.DIGITAL, pin: 8, alias: 'doorbutton', sensivity: 150 }
    ]
}
