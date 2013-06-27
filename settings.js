var firmata = require('./firmata-utils');

module.exports = {
    serial: '/dev/ttyACM0',
    ip: '0.0.0.0',
    port: 5042,
    prefix: 'AIO0',

    watch: [
        { type: firmata.DIGITAL, pin: 8, alias: 'doorframe' },
        { type: firmata.DIGITAL, pin: 12, alias: 'doorlock' },
        { type: firmata.DIGITAL, pin: 8, alias: 'doorbutton' }
    ]
}
