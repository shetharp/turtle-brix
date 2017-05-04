'use strict'

/* ======================================================================
  REQUIREMENTS: BACKEND & BOARD
====================================================================== */
const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


/* ======================================================================
  REQUIREMENTS: FRONTEND
====================================================================== */
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html')
});


/* ======================================================================
  ONCE BOARD IS READY
====================================================================== */
five.Board().on('ready', function() {
  console.log('\n[!!] Arduino is ready.');

  /* ----------------------------------------------------------------------
    Initialize Constants and Variables
  ---------------------------------------------------------------------- */
  const NUM_LEDS = 5;
  const LED_OFF = "off"; // keyword for led status off
  const LED_ON = "on"; // keyword for led status on
  const LED_BLINK = "blink"; // keyword for led status blink
  let LED = []; // array of led pin mappings
  let state = { leds: [] }; // state of board components

  for (var i = 0; i < NUM_LEDS; i++) {
    // Map pins to digital inputs on the Board
    // Start the leds from pin 13 counting down
    LED.push(new five.Led(13 - i));

    // Set all LEDs to off by default
    state.leds.push(LED_OFF);
  }


  /* ----------------------------------------------------------------------
    Helper Functions
  ---------------------------------------------------------------------- */
  /* Given a new state, apply its settings to each board component */
  let setState = function(newState) {
    console.log("[!!] Setting new state:");
    console.log(newState);
    console.log();
    for (var i = 0; i < NUM_LEDS; i++) {
      if (newState.leds[i] === LED_OFF) { LED[i].off(); }
      if (newState.leds[i] === LED_ON) { LED[i].on(); }
      if (newState.leds[i] === LED_BLINK) { LED[i].blink(500); }
    }
  }

  /* ----------------------------------------------------------------------
    Websocket Connection with Client
  ---------------------------------------------------------------------- */
  io.on('connection', function(client){
    client.on('join', function(handshake){
      console.log(handshake);
    });

    // Set initial state
    setState(state);

    // The 'updatePerson' event is triggered when a person's counter is changed
    // Every time a 'updatePerson' event is sent, listen to it and get its new
    // value. Then, translate that value into an LED state.
    client.on('updatePerson', function(data){
      var newLedState;
      switch (+data.value) {
        case 0:
          newLedState = LED_OFF;
          break;
        case 1:
        case 2:
          newLedState = LED_ON;
          console.log("WE SET THE LED TO ON!");
          break;
        case 3:
          newLedState = LED_BLINK;
        default:
          console.log("Default data.value case");
          newLedState = LED_BLINK;
      }

      for (var i = 0; i < NUM_LEDS; i++) {
        state.leds[i] = (data.led === ('person' + i)) ? newLedState : state.leds[i];
      }

      // Set the new board state
      setState(state);

      client.emit('updatePerson', data);
      client.broadcast.emit('updatePerson', data);
    });
  });

});

const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
