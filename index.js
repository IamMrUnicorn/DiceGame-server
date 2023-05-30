const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Replace with your Vite client URL
    methods: ['GET', 'POST'],
  },
});

let players = []
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your Vite client URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  
  socket.on('player', (player) => {
    socket.username = player.name;
    players.push(player)
    io.emit('players', players)
    console.log(`user ${socket.id} is now ${player.name}`)
  })

  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit('chat message', {msg})
  });

  socket.on('bet', (betAmmount) => {
    console.log(`${socket.username} betted: $${betAmmount}`)
    io.emit('bet', betAmmount)
  })

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
