let rectangle = {
    //Initialize paddle object variables
    x: 0,
    y: 550,
    w: 150,
    h: 25,

    update: function(){
        //Generates the rectangle coords based on the mouse position
        this.x = mouseX - this.w/2;
        fill("white")
        rect(this.x,this.y,this.w,this.h);
    }
}

function Ball(){
    this.speed = 2;
    this.x = 550;
    this.y = 200;
    this.d = 8;
    this.velX = -5;
    this.velY = 5;
    this.gravity = 0.1;
    this.blockCollide = false;
    this.canCollide = true;
    this.currentBlocksCollide = 0;
    this.update = function(){
        //Draws in the circle
        fill("#white");
        circle(this.x,this.y,this.d);

        //Updates circle's x and y based on velocity
        this.x += this.velX;
        this.y += this.velY;

        this.velY += this.gravity;

    }
    this.collideX = function(width){
        if(this.x<this.d||this.x>width-this.d){
            this.velX *= -1;
            if(this.x<this.d){
                this.x = this.d;
            }
            if(this.x>width-this.d){
                this.x = width-this.d;
            }
        }
    }
    this.collideY = function(){
        if(this.y<this.d){
            this.velY *= -1;
        }
    }
    this.collidePaddle = function(rectX,rectY,rectW,rectH){
        if(this.y + this.d > rectY && this.y - this.d < rectY + rectH && this.x + this.d > rectX && this.x - this.d < rectX + rectW) {
            //if(this.x<rectX + (rectW/4)){
            //    this.velX = -6;
            //    this.velY = -2;
            //}else if(this.x>rectX + (rectW/4)&& this.x<rectX + (rectW/2)){
            //    this.velX = -4;
            //    this.velY = -4;
            //}else if(this.x>rectX + (rectW/2)&& this.x<rectX + (rectW * .75)){
            //    this.velX = 4;
            //    this.velY = -4;
            //}else{
            //    this.velX = 6;
            //    this.velY = -2;
            //}

            this.velX = (((this.x-(rectX+(rectW/2)))/rectW)*15)
            //this.velY = (10 - Math.abs(this.velX)) * -1
            this.velY = -10
            
        } 
    }
    this.collideBlock = function(){
        for (i = 0; i<blocks.length; i++){
            if(i == 0){
                this.currentBlocksCollide = 0;
            }
            if(blocks[i].health > 0){
                if (this.x + this.d > blocks[i].x && this.x - this.d < blocks[i].x + blocks[i].w && this.y + this.d > blocks[i].y && this.y - this.d < blocks[i].y + blocks[i].h){
                    if(blocks[i].canBeHit){
                        blocks[i].health -= 1;
                        this.currentBlocksCollide ++;
                        if (blocks[i].ballDir == 1){
                            if(this.currentBlocksCollide==1){
                                this.velY *= -1;
                            }
                        }else if(blocks[i].ballDir == 2){
                            if(this.currentBlocksCollide==1){
                                this.velX *= -1;
                            }
                        }else{
                            if(this.currentBlocksCollide==1){
                                this.velX *= -1;
                                this.velY *= -1;
                            }
                        }
                        levelCreator.blockCount --;
                        score ++;
                        blocks[i].canBeHit = false;
                    }
                }else{
                    this.ballCollide = false;
                    blocks[i].canBeHit = true;
                }
            }
        }
    }
    this.reset = function(){
        this.x = 400;
        this.y = 400;
        this.velX = 0;
        this.velY = 2;
    }
    this.lose = function(){
        if (this.y-this.d>600){
            if(lives > 0){
                lives --;
                this.reset();
            }else{
                lives = 2;
                levelCreator.currentLevel = 0;
                levelCreator.generate();
                levelCreator.blockCount = 0;
                score = 0;
                this.reset();
            }
        }
    }
    this.coolDown = function(){
        if(timer>1){
            this.canCollide = true;
        }else{
            this.canCollide = false;
        }
    }
}

function Block(x,y,health){
    this.x = x;
    this.y = y;
    this.w = 100;
    this.h = 50;
    this.health = health;
    this.color = "red";
    this.ballDir = 0;
    this.canBeHit = true;

    this.update = function(){
        switch(this.health){
            case 1:
                this.color = "#FFC300";
                break;
            case 2:
                this.color = "#FF5733";
                break;
            case 3:
                this.color = "#C70039";
                break;
            case 4:
                this.color = "#900C3E";
                break;
            case 5:
                this.color = "#571845";
                break;
            default:
                this.color = "red";
        }
        if(this.health > 0){
            fill(this.color);
            rect(this.x,this.y,this.w,this.h);
            //console.log(this.health);
        }
    }
    /*this.collideBall = function(ballX, ballY, ballD){
        if (this.health > 0){
            if (ballX + ballD > this.x && ballX - ballD < this.x + this.w && ballY + ballD > this.y && ballY - ballD < this.y + this.h){
                if(this.canBeHit){
                    this.health -= 1;
                    if (this.ballDir == 1){
                        ball.velY *= -1;
                        levelCreator.blockCount --;
                        score ++;
                        timer = 0;
                        this.canBeHit = false;
                    }else if(this.ballDir == 2){
                        ball.velX *= -1;
                        levelCreator.blockCount --;
                        score ++;
                        timer = 0;
                        this.canBeHit = false;
                    }else{
                        ball.velX *= -1;
                        ball.velY *= -1;
                        levelCreator.blockCount --;
                        score++;
                        timer = 0;
                        this.canBeHit = false;
                    }
                }
            }else{
                ball.blockCollide = false;
                this.canBeHit = true;
            }

        }
    }*/
    this.senseBall = function(ballX, ballY, ballD, ballCollide){
        if(!ballCollide){
            if(ballX + ballD > this.x && ballX - ballD < this.x + this.w){
                this.ballDir = 1;
            }else if(ballY + ballD > this.y && ballY - ballD < this.y + this.h){
                this.ballDir = 2;
            }else{
                this.ballDir = 0;
            }
        }
    }
}

let levelCreator = {
    currentLevel: 0,
    levelActive: true,
    blockCount: 0,

    levels: [[0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0],
            
            [0,0,0,0,0,0,0,0,
             1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1,
             0,0,0,0,0,0,0,0],
            
            [1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1],
             
            [5,4,5,4,5,4,5,4,
             4,3,4,3,4,3,4,3,
             3,2,3,2,3,2,3,2,
             2,1,2,1,2,1,2,1],
            
            [5,5,5,5,5,5,5,5,
             5,5,5,5,5,5,5,5,
             5,5,5,5,5,5,5,5,
             5,5,5,5,5,5,5,5]
            ],

    generate: function(){
        for(n = 0; n<this.levels[this.currentLevel].length; n++){
            switch(this.levels[this.currentLevel][n]){
                case 0:
                    blocks[n].health = 0;
                    break;
                case 1:
                    blocks[n].health = 1;
                    this.blockCount ++;
                    break;
                case 2:
                    blocks[n].health = 2;
                    this.blockCount += 2;
                    break;
                case 3:
                    blocks[n].health = 3;
                    this.blockCount += 3;
                    break;
                case 4:
                    blocks[n].health = 4;
                    this.blockCount += 4;
                    break;
                case 5:
                    blocks[n].health = 5;
                    this.blockCount += 5;
                    break;
                default:
                    blocks[n].health = 0;
            }
        }
    },
    levelClearCheck: function(){
        //console.log(this.blockCount)
        if(this.blockCount == 0){
            this.levelAdvance();
        }
    },
    levelAdvance: function(){
        this.currentLevel ++;
        this.generate();
        ball.reset();
    }
}

let ball = new Ball();
let blocks = [block0 = new Block(0,100,0), block1 = new Block(100,100,0), block2 = new Block(200,100,0), block3 = new Block(300,100,0), block4 = new Block(400,100,0), block5 = new Block(500,100,0), block6 = new Block(600,100,0), block7 = new Block(700,100,0),
              block8 = new Block(0,150,0), block9 = new Block(100,150,0), block10 = new Block(200,150,0), block11 = new Block(300,150,0), block12 = new Block(400,150,0), block13 = new Block(500,150,0), block14 = new Block(600,150,0), block15 = new Block(700,150,0),
              block16 = new Block(0,200,0), block17 = new Block(100,200,0), block18 = new Block(200,200,0), block19 = new Block(300,200,0), block20 = new Block(400,200,0), block21 = new Block(500,200,0), block22 = new Block(600,200,0), block23 = new Block(700,200,0),
              block24 = new Block(0,250,0), block25 = new Block(100,250,0), block26 = new Block(200,250,0), block27 = new Block(300,250,0), block28 = new Block(400,250,0), block29 = new Block(500,250,0), block30 = new Block(600,250,0), block31 = new Block(700,250,0)]

let score = 0;
let lives = 2;
let timer = 0;

function setup(){
    createCanvas(800,600);
    //levelCreator.generate();
}

function draw(){
    background("black");
    strokeWeight(0);
    rectangle.update();
    //block.update();
    //block.collideBall(ball.x,ball.y,ball.d);
    for(let i = 0; i<blocks.length; i++){
        blocks[i].update();
        //blocks[i].collideBall(ball.x,ball.y,ball.d);
        blocks[i].senseBall(ball.x,ball.y,ball.d,ball.blockCollide);
    }
    ball.update();
    ball.lose();
    ball.collideX(width);
    ball.collideY();
    ball.collidePaddle(rectangle.x,rectangle.y,rectangle.w,rectangle.h);
    ball.collideBlock();
    levelCreator.levelClearCheck();

    textSize(32);
    fill("white")
    text('Score: ' + score, 10, 30);

    textSize(32);
    fill("white")
    text('Level: ' + levelCreator.currentLevel, 350, 30);

    textSize(32);
    fill("white")
    text('Lives: ' + lives, 660, 30);

    timer++;
}