(function() {
    var socket = io.connect(window.location.hostname + ':' + 3000);
    var led0 = document.getElementById('person0');
    var led1 = document.getElementById('person1');
    var led2 = document.getElementById('person2');
    var led3 = document.getElementById('person3');
    var led4 = document.getElementById('person4');

    function emitValue(personID, elem) {
        socket.emit('updatePerson', {
            led: personID,
            value: elem.target.value
        });
    }

    led0.addEventListener('change', emitValue.bind(null, 'person0'));
    led1.addEventListener('change', emitValue.bind(null, 'person1'));
    led2.addEventListener('change', emitValue.bind(null, 'person2'));
    led3.addEventListener('change', emitValue.bind(null, 'person3'));
    led4.addEventListener('change', emitValue.bind(null, 'person4'));

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('updatePerson', function(data) {
        var selectedPersonID = data.led;
        document.getElementById(selectedPersonID).value = data.value;
    });
}());
