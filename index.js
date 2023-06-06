const exp = require('constants');
const express = require('express');
const app = express();
const http = require('http');
const path = require('path')
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

// Serve static files from the "client/dist" directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Route handler for serving the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
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

  socket.on('start', () => {
    console.log('game started')
    io.emit('start')
  })
  
  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit('chat message', {msg})
  });

  socket.on('bet', (betAmmount) => {
    console.log(`${socket.username} betted: $${betAmmount}`)
    if (prizePool === 0){
      player1 = socket.username
      console.log(`${socket.username} is now player1`)
    } else {
      player2 = socket.username
      console.log(`${socket.username} is now player2`)
    }
    prizePool+=betAmmount
    io.emit('prize pool', prizePool)
  })

  socket.on('diceRoll', (roll) => {
    console.log(`${socket.username} rolled: ${roll}`)
    io.emit('diceRoll', `${socket.username} rolled: ${roll}`)
  })

  socket.on('yourNumber', (roll) => {
    console.log(`${socket.username}'s number: ${roll}`)
    io.emit('yourNumber', `${socket.username}'s number: ${roll}`)
  })

  socket.on('winner', () => {
    io.emit('reset pool')
    console.log(`${player1} just won $${prizePool}`)
    io.emit('prizeMoney', {winner: player1, prize: prizePool})
    prizePool = 0;
  })
  socket.on('loser', () => {
    io.emit('reset pool')
    console.log(`${player2} just won $${prizePool}`)
    io.emit('prizeMoney', {winner: player2, prize: prizePool})
    prizePool = 0;
  })

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
