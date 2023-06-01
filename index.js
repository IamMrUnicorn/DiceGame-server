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

let players = {}
let prizePool = 0;
let player1;
let player2;
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Replace with your Vite client URL
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.emit('newPlayer', 'wait')

  socket.on('player', (player) => {
    socket.username = player.name;
    players[socket.username] = player
    io.emit('players', players)
    console.log(`user ${socket.id} is now ${player.name}`)
  })

  socket.on('gameStart', () => {
    io.emit('gameStart')
  })

  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit('chat message', {msg})
  });

  socket.on('bet', (betAmmount) => {
    console.log(`${socket.username} betted: $${betAmmount}`)
    if (prizePool === 0){
      player1 = socket.username
    } else {
      player2 = socket.username
    }
    prizePool+=betAmmount
    io.emit('bet', betAmmount)
  })

  socket.on('diceRoll', (roll) => {
    console.log(`${socket.username} rolled: ${roll}`)
    io.emit('diceRoll', roll)
  })

  socket.on('yourNumber', (roll) => {
    console.log(`${socket.username}'s number: ${roll}`)
    io.emit('yourNumber', roll)
  })

  socket.on('winner', () => {
    io.emit('bet', 0)
    console.log(`${player1} just won $${prizePool}`)
    socket.emit('prizeMoney', prizePool)
    prizePool = 0;
  })
  socket.on('loser', () => {
    io.emit('bet', 0)
    console.log(`${player2} just won $${prizePool}`)
    io.emit('prizeMoney', {winner: player2, prize: prizePool})
    prizePool = 0;
  })

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
