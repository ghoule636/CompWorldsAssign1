function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0,500,800,300);
    Entity.prototype.draw.call(this);
}

function Samus(game) {//add count for turns instead of boolean so we can display a few frames with turning....
    this.idleRight = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 387, 55, 40, 50, .8, 2, true, false);
    this.runningRight = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 431, 300, 43, 50, .1, 10, true, false);
    this.jumpRight = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 980, 0, 33.8, 55, .07, 8, false, false);
    this.turnRight = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 300, 55, 40, 55, 1, 1, false, false);
    this.downRight = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 120, 180, 40, 55, 1, 1, true, false);
    this.downRightTurn = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 80, 180, 40, 55, 1, 1, false, false);

    this.idleLeft = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 142, 55, 39, 50, .8, 2, true, true);
    this.runningLeft = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 0, 300, 42.1, 50, .1, 10, true, false);
    this.jumpLeft = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 733.1, 0, 31.5, 55, .07, 8, false, false);
    this.turnLeft = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 260, 55, 40, 55, 1, 1, false, false);
    this.downLeft = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 0, 180, 40, 55, 1, 1, true, false);
    this.downLeftTurn = new Animation(ASSET_MANAGER.getAsset("./img/Fusion-Samus.png"), 40, 180, 40, 55, 1, 1, false, false);
                                                                                                                             
    this.running = false;
    this.lastDirection = "right";
    this.radius = 100;
    this.ground = 400;
    this.speed = 550;
    Entity.call(this, game, 300, 400);
}

Samus.prototype = new Entity();
Samus.prototype.constructor = Samus;

Samus.prototype.update = function () {
    if (this.game.space) this.jumping = true;
    if (this.game.running) {
        this.running = true;
    }
    if (this.jumping) {
        if (this.jumpRight.isDone() || this.jumpLeft.isDone()) {
            this.jumpRight.elapsedTime = 0;
            this.jumpLeft.elapsedTime = 0;
            this.jumping = false;
        }
        if (this.game.right) {//jump right
            if (this.jumpLeft.elapsedTime > 0) {//enables player to switch directions while jumping
                this.jumpRight.elapsedTime += this.jumpLeft.elapsedTime;
                this.jumpLeft.elapsedTime = 0;
            }
            var jumpDistance = (this.jumpRight.elapsedTime) / this.jumpRight.totalTime;
        } else {//jump left
            if (this.jumpRight.elapsedTime > 0) {
                this.jumpLeft.elapsedTime += this.jumpRight.elapsedTime;
                this.jumpRight.elapsedTime = 0;
            }
            var jumpDistance = (this.jumpLeft.elapsedTime) / this.jumpLeft.totalTime;
        }
        var totalHeight = 200;

        if (jumpDistance > 0.5) {
            jumpDistance = 1 - jumpDistance;
        }
        var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    if (this.running) {
        if (!this.game.running) {
            this.running = false;
        }
        if (this.game.right) {
            this.x += this.game.clockTick * this.speed;
            if (this.x > 800) this.x = -100;
        } else if (!this.game.right) {
            this.x -= this.game.clockTick * this.speed;
            if (this.x < -100) this.x = 800;
        }
    }
    Entity.prototype.update.call(this);
}

Samus.prototype.draw = function (ctx) {
    if (this.game.right) {//draw right facing sprites
        if (this.jumping) {
            this.jumpRight.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34, 3);
        } else if (this.game.down) {
            if (this.lastDirection === "left") {
                this.downRightTurn.drawFrame(this.game.clockTick, ctx, this.x, this.y + 23, 3);
                this.lastDirection = "right";
            } else {
                this.downRight.drawFrame(this.game.clockTick, ctx, this.x, this.y + 23, 3);
            }
        } else if (this.running) {
            if (this.lastDirection === "left") {
                this.turnRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
                this.lastDirection = "right";
            } else {
                this.runningRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
            }
        } else {
            this.idleRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        }
    } else if (!this.game.right) {//draw left facing sprites
        if (this.jumping) {
            this.jumpLeft.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34, 3);
        } else if (this.game.down) {
            if (this.lastDirection === "right") {
                this.downLeftTurn.drawFrame(this.game.clockTick, ctx, this.x, this.y + 23, 3);
                this.lastDirection = "left";
            }
            this.downLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y + 23, 3);
        } else if (this.running) {
            if (this.lastDirection === "right") {
                this.turnLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
                this.lastDirection = "left";
            } else {
                this.runningLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
            }
        }  else {
            this.idleLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, 3);
        }
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/Fusion-Samus.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var samus = new Samus(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(samus);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
