(function() {
    var socket = io.connect(window.location.hostname + ':' + 3000);
    var led1 = document.getElementById('led-one');
    var led2 = document.getElementById('led-two');

    function emitValue(ledID, elem) {
        socket.emit('lightChange', {
            led: ledID,
            value: elem.target.value
        });
    }

    led1.addEventListener('change', emitValue.bind(null, 'led-one'));
    led2.addEventListener('change', emitValue.bind(null, 'led-two'));

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('lightChange', function(data) {
        var selectedLedID = data.led;
        document.getElementById(selectedLedID).value = data.value;
    });
}());
