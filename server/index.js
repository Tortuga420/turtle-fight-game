const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const players = new Map();
const gameState = {
    players: {},
    projectiles: []
};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('join', (playerData) => {
        players.set(socket.id, {
            id: socket.id,
            x: Math.random() * 800,
            y: Math.random() * 600,
            health: 100,
            color: playerData.color,
            name: playerData.name
        });
        
        gameState.players[socket.id] = players.get(socket.id);
        io.emit('gameState', gameState);
    });

    socket.on('playerMove', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.x = data.x;
            player.y = data.y;
            gameState.players[socket.id] = player;
            io.emit('gameState', gameState);
        }
    });

    socket.on('attack', (data) => {
        const player = players.get(socket.id);
        if (player) {
            gameState.projectiles.push({
                id: Date.now(),
                x: player.x,
                y: player.y,
                angle: data.angle,
                playerId: socket.id
            });
            io.emit('gameState', gameState);
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        players.delete(socket.id);
        delete gameState.players[socket.id];
        io.emit('gameState', gameState);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 