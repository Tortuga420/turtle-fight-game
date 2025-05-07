class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = null;
        this.gameState = {
            players: {},
            projectiles: []
        };
        
        this.keys = {};
        this.turtleImages = {};
        this.obstacles = [
            { x: 200, y: 150, width: 100, height: 20 },
            { x: 500, y: 300, width: 20, height: 100 },
            { x: 300, y: 450, width: 150, height: 20 },
            { x: 100, y: 400, width: 20, height: 80 },
            { x: 600, y: 200, width: 80, height: 20 }
        ];
        
        this.turtleSize = 45; // Reduced from 60 by 25%
        this.loadImages();
        this.setupEventListeners();
    }

    loadImages() {
        const colors = ['red', 'blue', 'green', 'purple'];
        colors.forEach(color => {
            const img = new Image();
            img.src = `assets/turtles/${color}-turtle.svg`;
            this.turtleImages[color] = img;
        });
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('click', (e) => this.handleAttack(e));

        document.getElementById('start-game').addEventListener('click', () => {
            const name = document.getElementById('player-name').value || 'Player';
            const color = document.getElementById('turtle-color').value;
            this.startGame(name, color);
        });
    }

    startGame(name, color) {
        this.player = {
            id: 'player1',
            name: name,
            color: color,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            health: 100
        };
        this.gameState.players[this.player.id] = this.player;
        document.getElementById('start-screen').style.display = 'none';
        
        // Update health bar color
        const healthBar = document.getElementById('health-bar');
        healthBar.style.setProperty('--turtle-color', this.getTurtleColor(color));
    }

    getTurtleColor(color) {
        const colors = {
            red: '#ff4444',
            blue: '#4444ff',
            green: '#44ff44',
            purple: '#aa44ff'
        };
        return colors[color] || '#4CAF50';
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    handleAttack(e) {
        if (!this.player) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const angle = Math.atan2(y - this.player.y, x - this.player.x);
        this.gameState.projectiles.push({
            id: Date.now(),
            x: this.player.x,
            y: this.player.y,
            angle: angle,
            playerId: this.player.id,
            speed: 10
        });
    }

    checkCollision(x, y, width, height, otherX, otherY, otherWidth, otherHeight) {
        return x < otherX + otherWidth &&
               x + width > otherX &&
               y < otherY + otherHeight &&
               y + height > otherY;
    }

    update() {
        if (!this.player) return;

        const speed = 5;
        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys['w']) newY -= speed;
        if (this.keys['s']) newY += speed;
        if (this.keys['a']) newX -= speed;
        if (this.keys['d']) newX += speed;

        // Check collision with obstacles using smaller size
        let canMove = true;
        for (const obstacle of this.obstacles) {
            if (this.checkCollision(
                newX - this.turtleSize/2, newY - this.turtleSize/2, 
                this.turtleSize, this.turtleSize,
                obstacle.x, obstacle.y, obstacle.width, obstacle.height
            )) {
                canMove = false;
                break;
            }
        }

        if (canMove) {
            this.player.x = Math.max(0, Math.min(this.canvas.width, newX));
            this.player.y = Math.max(0, Math.min(this.canvas.height, newY));
        }

        // Update projectiles
        this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
            const newX = projectile.x + Math.cos(projectile.angle) * projectile.speed;
            const newY = projectile.y + Math.sin(projectile.angle) * projectile.speed;
            
            // Check collision with obstacles
            let canMove = true;
            for (const obstacle of this.obstacles) {
                if (this.checkCollision(
                    newX - 5, newY - 5, 10, 10,
                    obstacle.x, obstacle.y, obstacle.width, obstacle.height
                )) {
                    canMove = false;
                    break;
                }
            }
            
            if (canMove) {
                projectile.x = newX;
                projectile.y = newY;
            }
            
            // Remove projectiles that are out of bounds or hit obstacles
            return canMove && 
                   projectile.x >= 0 && projectile.x <= this.canvas.width &&
                   projectile.y >= 0 && projectile.y <= this.canvas.height;
        });
    }

    drawBrick(x, y, width, height) {
        const brickWidth = 20;
        const brickHeight = 10;
        const mortarColor = '#444';
        const brickColor = '#8B4513';
        
        // Draw mortar background
        this.ctx.fillStyle = mortarColor;
        this.ctx.fillRect(x, y, width, height);
        
        // Draw bricks
        this.ctx.fillStyle = brickColor;
        for (let row = 0; row < height; row += brickHeight) {
            const offset = (row / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            for (let col = offset; col < width; col += brickWidth) {
                this.ctx.fillRect(
                    x + col,
                    y + row,
                    Math.min(brickWidth, width - col),
                    Math.min(brickHeight, height - row)
                );
            }
        }
        
        // Add brick texture
        this.ctx.strokeStyle = '#6B3410';
        for (let row = 0; row < height; row += brickHeight) {
            const offset = (row / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
            for (let col = offset; col < width; col += brickWidth) {
                this.ctx.strokeRect(
                    x + col,
                    y + row,
                    Math.min(brickWidth, width - col),
                    Math.min(brickHeight, height - row)
                );
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw obstacles as bricks
        this.obstacles.forEach(obstacle => {
            this.drawBrick(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw players
        Object.values(this.gameState.players).forEach(player => {
            this.ctx.save();
            this.ctx.translate(player.x, player.y);
            
            // Calculate angle to mouse position
            const angle = Math.atan2(this.mouseY - player.y, this.mouseX - player.x);
            this.ctx.rotate(angle);
            
            // Draw turtle image with smaller size
            const img = this.turtleImages[player.color];
            if (img && img.complete) {
                this.ctx.drawImage(img, -this.turtleSize/2, -this.turtleSize/2, this.turtleSize, this.turtleSize);
            }
            
            // Draw player name
            this.ctx.rotate(-angle); // Reset rotation for text
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(player.name, 0, -this.turtleSize/2 - 10);
            
            this.ctx.restore();
        });

        // Draw projectiles
        this.gameState.projectiles.forEach(projectile => {
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.gameState.players[projectile.playerId]?.color || 'white';
            this.ctx.fill();
        });

        // Update health bar
        if (this.player) {
            const healthBar = document.getElementById('health-bar');
            healthBar.style.setProperty('--health', `${this.player.health}%`);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
const game = new Game();
game.gameLoop(); 