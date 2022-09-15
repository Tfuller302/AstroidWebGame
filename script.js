// paddle.js file 🐦🐦🐦
class Paddle {
    constructor(game) {
        this.gameWidth = game.gameWidth;
        this.size = {width: 150, height: 20};
        this.maxSpeed = 7;
        this.speed = 0;
        this.position = {
            x: (game.gameWidth / 2) - (this.size.width / 2),
            y: game.gameHeight - this.size.height - 10
        }
    };
    draw(ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
    };
    moveLeft() {
        this.speed = -this.maxSpeed;
    };
    moveRight() {
        this.speed = this.maxSpeed;
    };
    stop() {
        this.speed = 0;
    };
    update(deltaTime) {
        this.position.x += this.speed;
        if(this.position.x < 0) {
            this.position.x = 0;
        } else if(this.position.x > (this.gameWidth - this.size.width)) {
            this.position.x = this.gameWidth - this.size.width;
        }
    };
};

// input.js file 🦆🦆🦆
class InputHandler {
    constructor(paddle, game) {
        document.addEventListener("keydown", (event) => {
            switch(event.keyCode) {
                case 37:
                    paddle.moveLeft();
                    break;
                case 39:
                    paddle.moveRight();
                    break;
            }
        });
        document.addEventListener("keyup", (event) => {
            switch(event.keyCode) {
                case 37:
                    if(paddle.speed < 0) {
                        paddle.stop();
                    };
                    break;
                case 39:
                    if(paddle.speed > 0) {
                        paddle.stop();
                    };
                    break;
                case 27:
                    game.togglePause();
                    break;
                case 32:
                    game.start();
            }
        });    
    }
}

// ball.js file 🐧🐧🐧
class Ball {
    constructor(game) {
        this.image = document.getElementById("img-ball");
        this.position = {x: 10, y: 400};
        this.speed = {x: 4, y: -4};
        this.size = {width: 16, height: 16};
        this.gameWidth = game.gameWidth;
        this.gameHeight = game.gameHeight;
        this.game = game;
    };
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
    };
    update(deltaTime) {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        // check for collision with left or right wall
        if(this.position.x > (this.gameWidth - this.size.width) || this.position.x < 0) {
            this.speed.x = -this.speed.x;
        };
        // check for collison with top wall
        if(this.position.y < 0) {
            this.speed.y = -this.speed.y;
        };
        // check for collision with bottom wall
        if(this.position.y > (this.gameHeight - this.size.height)) { 
            this.game.lives -= 1;
            if(this.game.lives === 0) {
                this.game.gamestate = GAME_STATE.GAMEOVER;
            };
            this.reset();
        };
        // check for collision with paddle
        if(detectCollision(this, this.game.paddle) === true) {
            this.speed.y = -this.speed.y;
            this.position.y = this.game.paddle.position.y - this.size.height;
        }
    };
    reset() {
        this.position = {x: 10, y: 400};
        this.speed = {x: 4, y: -4};
    };
}

// colision_detection.js file 🦅🦅🦅
function detectCollision(ball, gameObject) {
    // check for collision with object
    let bottomOfBall = ball.position.y + ball.size.height;
    let topOfBall = ball.position.y;
    let topOfObject = gameObject.position.y;
    let leftSideOfObject = gameObject.position.x;
    let rightSideOfObject = gameObject.position.x + gameObject.size.width;
    let bottomOfObject = gameObject.position.y + gameObject.size.height;
    if(bottomOfBall >= topOfObject && topOfBall <= bottomOfObject && 
        ball.position.x + (ball.size.width) >= leftSideOfObject && ball.position.x <= rightSideOfObject) {
        return true;
    } else {
        return false;
    }

}    

// bricks.js file 🦉🦉🦉
class Brick {
    constructor(game, position) {
        this.image = document.getElementById("img-brick");
        this.position = position;
        this.size = {width: 80, height: 24};
        this.game = game;
        this.markedForDeletion = false;
    };
    update() {
        if(detectCollision(this.game.ball, this) === true) {
            this.game.ball.speed.y = -this.game.ball.speed.y;
            this.markedForDeletion = true;
        };
    };
    draw(ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size.width, this.size.height);
    };
}

// levels.js file 🦢🦢🦢
function buildLevel(game, level) {
    let bricks = [];
    level.forEach((row, index) => {
        row.forEach((brick, brickIndex) => {
            if(brick === 1) {
                let position = {x: 80 * brickIndex, y: 75 + (24 * index)};
                bricks.push(new Brick(game, position));
            };
        });
    });
    return bricks;
};

// game.js file 🦚🦚🦚
const level1 = [
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
const level2 = [
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
const GAME_STATE = {
    PAUSED: 0,
    RUNNING: 1,
    MENU: 2,
    GAMEOVER: 3,
    NEWLEVEL: 4
}

class Game {
    constructor(gamewidth, gameheight) {
        this.gameWidth = gamewidth;
        this.gameHeight = gameheight;
        this.gamestate = GAME_STATE.MENU;
        this.paddle = new Paddle(this);
        this.ball = new Ball(this);
        this.gameObjects = [];
        this.bricks = [];
        this.lives = 3;
        this.levels = [level1, level2];
        this.currentLevel = 0;
        new InputHandler(this.paddle, this);
    };
    start() {
        if(this.gamestate !== GAME_STATE.MENU &&
            this.gamestate !== GAME_STATE.NEWLEVEL) {
            return;
        }
        this.bricks = buildLevel(this, this.levels[this.currentLevel]);
        this.ball.reset();
        this.gameObjects = [
            this.ball,
            this.paddle
        ];
        this.gamestate = GAME_STATE.RUNNING;
    }; 
    update(deltaTime) {
        if(this.lives === 0) {
            this.gamestate === GAME_STATE.GAMEOVER;
        };
        if(this.gamestate === GAME_STATE.PAUSED || 
            this.gamestate === GAME_STATE.MENU || 
            this.gamestate === GAME_STATE.GAMEOVER) {
            return;
        };
        if(this.bricks.length === 0) {
            this.currentLevel++;
            this.gamestate = GAME_STATE.NEWLEVEL;
            this.start();
        };
        [...this.gameObjects, ...this.bricks].forEach((object) => object.update(deltaTime)); 
        this.bricks = this.bricks.filter((brick) => !brick.markedForDeletion);
    };
    draw(ctx) {
        [...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx));
        if(this.gamestate === GAME_STATE.PAUSED) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("🚏 PAUSED 🚏", this.gameWidth / 2, this.gameHeight / 2);
        };
        if(this.gamestate === GAME_STATE.MENU) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(0, 0, 0, 1)"
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("🚀 PRESS SPACEBAR TO START 🚀", this.gameWidth / 2, this.gameHeight / 2);
        };
        if(this.gamestate === GAME_STATE.GAMEOVER) {
            ctx.rect(0, 0, this.gameWidth, this.gameHeight);
            ctx.fillStyle = "rgba(200, 0, 0, 1)"
            ctx.fill();
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("🐖💩 GAME OVER 🐖💩", this.gameWidth / 2, this.gameHeight / 2);
        };
    };
    togglePause() {
        if(this.gamestate === GAME_STATE.PAUSED) {
            this.gamestate = GAME_STATE.RUNNING;
        } else {
            this.gamestate = GAME_STATE.PAUSED;
        }
    }
}

// index.js file 🦃🦃🦃
let canvas = document.getElementById("game-screen");
let ctx = canvas.getContext("2d"); //canvas context
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
let game = new Game(GAME_WIDTH, GAME_HEIGHT);
ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
let lastTime = 0;

// game loop
function gameLoop(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, 800, 600);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);