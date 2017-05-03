'use strict'

const five = require('johnny-five');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html')
});

five.Board().on('ready', function() {
  console.log('Arduino is ready.');

  // Initial state for the Turtle
  let state = {
    led1: 500,
    led2: 500
  }

  // Map pins to digital inputs on the Board
  const LED1 = new five.Led(13);
  const LED2 = new five.Led(12);

  // Helper function to set the LED speeds
  let setState = function(newState) {
    console.log("We'll be setting the following new state:");
    console.log(newState);
    LED1.blink(newState.led1);
    LED2.blink(newState.led2);
    console.log("The new state was applied!");
  }


  io.on('connection', function(client){
    client.on('join', function(handshake){
      console.log(handshake);
    });

    // Set initial state
    setState(state);

    // Every time a 'lightChange' event is sent, listen to it and get its new
    // value for each individual LED
    client.on('lightChange', function(data){
      state.led1 = (data.led === 'led-one') ? data.value : state.led1;
      state.led2 = (data.led === 'led-two') ? data.value : state.led2;

      // Set the new speed
      setState(state);

      client.emit('lightChange', data);
      client.broadcast.emit('lightChange', data);
    });
  });

});

const port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
