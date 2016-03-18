var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var history = {};

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

app.get(/[a-z]+/, function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});


io.on('connection', function(socket) {
  console.log('A user connected');
  var currentRoom = 'default';

  socket.on('join room', function(room) {
    console.log('Joining room ' + room);
    currentRoom = room;
    socket.join(room);

    if (history[currentRoom] != undefined && history[currentRoom].constructor === Array) {
      for (var i = 0; i < history[currentRoom].length; i++) {
        socket.emit('new message', history[currentRoom][i]);
      }
    } else {
      history[currentRoom] = [];
    }
  });


  socket.on('new message', function(msg) {
    console.log('Got new message: ' + msg);
    if (history[currentRoom] == undefined) {
      history[currentRoom] = [msg];
    } else { 
      history[currentRoom].push(msg);
    }

    io.to(currentRoom).emit('new message', msg);
  });

  socket.on('disconnect', function() {
    console.log('A user disconnected');
  });
});

http.listen(3000, function() {
  console.log('Started on port 3000');
});
