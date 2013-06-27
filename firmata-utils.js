var firmata = require('firmata');

firmata.Board.prototype.digitalDebounced = function(pin, cb, sens) {
    
    var  timeout     = false
        ,sensitivity = sens || 70
        ,last_sent   = null
        ,last_value  = null;

    this.digitalRead(pin, function(val) {

        if(timeout !== false) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function() {
            timeout = false;
            
            if(last_value != last_sent) {
                cb(last_value);
            }

            last_sent = last_value;
        }, sensitivity);

        last_value = val;
    });
};

firmata.DIGITAL = 1;
firmata.ANALOG  = 2;

module.exports = firmata;
