(function() {
    var socket = io.connect(window.location.hostname + ':' + 3000);
    let NUM_LEDS = 5;
    var personElems = []; // Array of element of people
    var personCount = {}; // Object with key => element IDs and value => count
    var resetButton;

    for (var i = 0; i < NUM_LEDS; i++) {
      personElems.push(document.getElementById('person' + i));
      personElems[i].addEventListener('change', emitUpdateCounter.bind(null, 'person' + i));
      personCount[personElems[i].id] = 0;
    }

    resetButton = document.getElementById('reset-people');
    resetButton.addEventListener('click', emitResetCounter.bind());

    // Emit an event to the Board to
    function emitUpdateCounter(personID, elem) {
      personCount[personID] = +(elem.target.value);
      socket.emit('updatePerson', personCount);
    }

    function emitResetCounter() {
      for (var i = 0; i < NUM_LEDS; i++) {
        personElems[i].value = 0;
        personCount["person" + i] = 0;
      }
      socket.emit('updatePerson', personCount);
    }

    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('updatePerson', function(data) {
      // The data variable is what is passed by socket.emit()
      console.log("[!!] This is happening on updatePerson");
      console.log(data);
      console.log("==========");
      for (var personID in data) {
        if (data.hasOwnProperty(personID)) {
          document.getElementById(personID).value = data[personID];
        }
      }
    });

    socket.on('reset')
}());
