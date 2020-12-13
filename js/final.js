//Paddle Object
let rectangle = {
    //Initialize paddle object variables
    x: 0,
    y: 550,
    w: 80,
    h: 25,

    update: function(){
        //Generates the rectangle coords based on the mouse position
        this.x = mouseX - this.w/2;
        fill("white")
        rect(this.x,this.y,this.w,this.h);
    }
}

//Constructor for ball objects
function Ball(){
    //Initialize variables for speed, velocity, & gravity
    this.x = 400;
    this.y = 400;
    this.d = 8;
    this.velX = -5;
    this.velY = 5;
    this.gravity = 0.1;

    //Initialize variables related to collision
    this.blockCollide = false;
    //This variable represents how many blocks the ball is colliding with at any given moment
    this.currentBlocksCollide = 0;

    //Update function. Runs every frame
    this.update = function(){
        //Draws in the circle
        fill("#white");
        circle(this.x,this.y,this.d);

        //Updates circle's x and y based on velocity
        this.x += this.velX;
        this.y += this.velY;

        //Updates circle's y velocity based on gravity
        this.velY += this.gravity;

    }

    //Function that handles collisions will the side walls
    this.collideX = function(width){
        if(this.x<this.d||this.x>width-this.d){
            //Ball bounces horizontally when it collides with either wall
            this.velX *= -1;

            //This portion teleports the ball within the bounds to prevent it from getting stuck in the walls
            if(this.x<this.d){
                this.x = this.d;
            }
            if(this.x>width-this.d){
                this.x = width-this.d;
            }
        }
    }

    //Function that handles collisions with the ceiling
    this.collideY = function(){
        if(this.y<this.d){
            this.velY *= -1;
            this.y = this.d;
        }
    }

    //Function that handles collisions with the paddle
    this.collidePaddle = function(rectX,rectY,rectW,rectH){
        if(this.y + this.d > rectY && this.y - this.d < rectY + rectH && this.x + this.d > rectX && this.x - this.d < rectX + rectW) {
            //This part makes it so the ball's horizontal velocity depends on where it touches the paddle
            this.velX = (((this.x-(rectX+(rectW/2)))/rectW)*15);
            this.velY = -10;
            
        } 
    }

    //Function that handles collisions with the blocks
    this.collideBlock = function(){
        //Uses for loop to check all block objects in the array
        for (i = 0; i<blocks.length; i++){
            //Resets the currentBlocksCollide variable to zero on every pass of the for loop
            if(i == 0){
                this.currentBlocksCollide = 0;
            }
            //Blocks with a health value of zero are invisible and are uncollidable
            if(blocks[i].health > 0){
                if (this.x + this.d > blocks[i].x && this.x - this.d < blocks[i].x + blocks[i].w && this.y + this.d > blocks[i].y && this.y - this.d < blocks[i].y + blocks[i].h){
                    //This if statement makes it so the block only registers one hit even if the ball stays within it's bounds for longer than 1 frame
                    if(blocks[i].canBeHit){
                        //Gray blocks are unbreakable and don't count towards score/level clear
                        if(blocks[i].breakable){
                            blocks[i].health -= 1;
                            levelCreator.blockCount --;
                            score ++;
                        }
                        this.currentBlocksCollide ++;

                        //Determines which direction the ball should bounce (See the "senseBall" function in the "Block" constructor for more info)
                        if (blocks[i].ballDir == 1){
                            if(this.currentBlocksCollide==1){
                                this.velY *= -1;
                            }
                        }else if(blocks[i].ballDir == 2){
                            if(this.currentBlocksCollide==1){
                                this.velX *= -1;
                            }
                        }else{
                            //Still have yet to determine whether corner bounces actually work properly :/
                            if(this.currentBlocksCollide==1){
                                this.velX *= -1;
                                this.velY *= -1;
                            }
                        }
                        //Blocks cannot be hit multiple times during a single collision
                        blocks[i].canBeHit = false;
                    }
                }else{
                    //Resets variables when ball isn't colliding anymore
                    this.ballCollide = false;
                    blocks[i].canBeHit = true;
                }
            }
        }
    }

    //This function resets the ball to the center of the screen
    this.reset = function(){
        this.x = 400;
        this.y = 400;
        this.velX = 0;
        this.velY = -3;
    }

    //This function is responsible for when the ball reaches the bottom of the screen
    this.lose = function(){
        if (this.y-this.d>600){
            //Makes you lose a life (assuming you have lives to lose)
            if(lives > 0){
                lives --;
                this.reset();
                levelCountdown();
            
            //Triggers the game to reset when you die without any lives to spare
            }else{
                lives = 2;
                levelCreator.currentLevel = 0;
                levelCreator.generate();
                levelCreator.blockCount = 0;
                titleScreen = true;
                inGame = false;
                this.reset();
            }
        }
    }
}

//Constructor for Block objects
function Block(x,y,health){
    //Initializes variables for block position, width, and height
    this.x = x;
    this.y = y;
    this.w = 100;
    this.h = 50;

    //Initializes variables for block health & color (these variables are often linked)
    this.health = health;
    this.color = "red";

    //Initialize variables related to collision detection
    this.ballDir = 0;
    this.canBeHit = true;
    this.breakable = true;

    //Standard blocks change color depending on health
    this.standard = true;

    //Update function runs every frame
    this.update = function(){
        //If blocks are standard & breakable, their color is determined by their health value
        if(this.breakable && this.standard){
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
                case 6:
                    this.color = "#2E0C68";
                    break;
                default:
                    this.color = "red";
            }

        //The unbreakable blocks are the only exception to this so far
        }else{
            this.color = "gray";
        }

        //Only blocks that still have health are visible
        if(this.health > 0){
            fill(this.color);
            rect(this.x,this.y,this.w,this.h);
        }
    }

    //Function responsible for detecting where the ball is in relation to the block
    //This is used to determine which direction the ball should bounce on impact
    this.senseBall = function(ballX, ballY, ballD, ballCollide){
        //Only updates ball direction values if there is no collision happening
        if(!ballCollide){
            //Sets ballDir to 1 when the ball is above of below
            if(ballX + ballD > this.x && ballX - ballD < this.x + this.w){
                this.ballDir = 1;

            //Sets ballDir to 2 when the ball is to the left or right
            }else if(ballY + ballD > this.y && ballY - ballD < this.y + this.h){
                this.ballDir = 2;

            }else{
                this.ballDir = 0;
            }
        }
    }
}

//Level Creator Object
let levelCreator = {
    //Represents the current level the player is on
    currentLevel: 0,

    //Represents how many blocks are present in each level (not including unbreakable or health=0 blocks)
    blockCount: 0,

    //2D Array that stores the maps for each level (Makes creating new levels pretty easy)
    //The numbers are the ids that represent each type of block
    levels: [
            //This level should stay all 0s
            [0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0],
            
            [0,0,0,0,0,0,0,0,
             1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1,
             0,0,0,0,0,0,0,0],
            
            [1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1,
             2,2,2,2,2,2,2,2,
             1,1,1,1,1,1,1,1,
             1,1,1,1,1,1,1,1],
            
            [3,3,3,3,3,3,3,3,
             2,2,2,2,2,2,2,2,
             1,9,9,1,1,9,9,1,
             2,1,1,2,2,1,1,2,
             1,1,1,1,1,1,1,1],
            
            [3,3,3,3,3,3,3,3,
             0,0,0,0,0,0,0,0,
             4,4,4,4,4,4,4,4,
             0,0,0,0,0,0,0,0,
             3,3,3,3,3,3,3,3],
             
            [6,5,6,5,6,5,6,5,
             5,4,5,4,5,4,5,4,
             4,3,4,3,4,3,4,3,
             3,2,3,2,3,2,3,2,
             2,1,2,1,2,1,2,1],
            
            [4,5,4,3,3,4,5,4,
             5,6,5,4,4,5,6,5,
             4,5,4,3,3,4,5,4,
             3,4,3,4,4,3,4,3,
             2,3,4,5,5,4,3,2],

            [9,9,9,9,9,9,9,9,
             5,5,5,5,5,5,5,5,
             3,3,3,3,3,3,3,3,
             3,3,5,5,5,5,3,3,
             3,3,9,9,9,9,3,3],

            [6,6,6,6,6,6,6,6,
             6,0,0,0,0,0,0,6,
             6,0,6,6,6,6,0,6,
             6,0,6,9,9,6,0,6,
             6,0,6,0,0,6,0,6],

            [2,2,2,2,2,2,2,2,
             2,9,9,6,6,9,9,2,
             2,2,2,2,2,2,2,2,
             3,3,3,9,9,3,3,3,
             6,6,6,5,5,6,6,6]
            ],

    //This function uses the 2d array of levels to set up all the block objects
    generate: function(){
        for(n = 0; n<this.levels[this.currentLevel].length; n++){
            //Ids 0-6 represent blocks with respective health health values. Id 9 represents unbreakable blocks
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
                case 6:
                    blocks[n].health = 6;
                    this.blockCount += 6;
                    break;
                case 9:
                    blocks[n].health = 6;
                    blocks[n].breakable = false;
                    break;
                default:
                    blocks[n].health = 0;
            }
            if(this.levels[this.currentLevel][n] != 9){
                blocks[n].breakable = true;
            }
        }
    },

    //This function checks if the level is clear of blocks. Calls levelAdvance if true
    levelClearCheck: function(){
        if(this.blockCount == 0){
            this.levelAdvance();
        }
    },

    //This function triggers the next level to generate if there are still levels left.
    levelAdvance: function(){
        if(this.currentLevel<this.levels.length-1){
            this.currentLevel ++;
            this.generate();
            ball.reset();
            levelCountdown();
        }else{
            titleScreen = true;
            inGame = false;
            this.currentLevel = 0;
            this.generate();
            lives = 2;
        }
    }
}

//Default ball object (Will probably turn this into an array once I make a multiball powerup)
let ball = new Ball();

//Default array of block objects with their positions
let blocks = [block0 = new Block(0,50,0), block1 = new Block(100,50,0), block2 = new Block(200,50,0), block3 = new Block(300,50,0), block4 = new Block(400,50,0), block5 = new Block(500,50,0), block6 = new Block(600,50,0), block7 = new Block(700,50,0),
              block8 = new Block(0,100,0), block9 = new Block(100,100,0), block10 = new Block(200,100,0), block11 = new Block(300,100,0), block12 = new Block(400,100,0), block13 = new Block(500,100,0), block14 = new Block(600,100,0), block15 = new Block(700,100,0),
              block16 = new Block(0,150,0), block17 = new Block(100,150,0), block18 = new Block(200,150,0), block19 = new Block(300,150,0), block20 = new Block(400,150,0), block21 = new Block(500,150,0), block22 = new Block(600,150,0), block23 = new Block(700,150,0),
              block24 = new Block(0,200,0), block25 = new Block(100,200,0), block26 = new Block(200,200,0), block27 = new Block(300,200,0), block28 = new Block(400,200,0), block29 = new Block(500,200,0), block30 = new Block(600,200,0), block31 = new Block(700,200,0),
              block32 = new Block(0,250,0), block33 = new Block(100,250,0), block34 = new Block(200,250,0), block35 = new Block(300,250,0), block36 = new Block(400,250,0), block37 = new Block(500,250,0), block38 = new Block(600,250,0), block39 = new Block(700,250,0)]

//Global variables representing score and lives remaining
let score = 0;
let lives = 2;

//This variable is used for the countdown timer
let count = 3;

//This variable is true when the player is in game (not true when they are on the titlescreen or in a countdown)
let inGame = false;

//This variable is true during the countdown sequence before each level starts
let countDown = false;

//Timer variable used in the countdown function
let timer = 0;

//Only true when the player is on the title screen
let titleScreen = true;

//This function is responsible for the countdown sequence that occurs before each level starts
function levelCountdown(){
    inGame = false;
    countDown = true;
    textSize(50);
    textAlign(CENTER);
    fill("white")
    text(count, 400, 400);
    timer ++;
    if(timer == 59){
        timer = 0;
        count --;
        //Level starts at the end of the countdown
        if (count==0){
            countDown = false;
            inGame = true;
            count = 3;
        }
    }
}

//Function that sets up the canvas size
function setup(){
    createCanvas(800,600);
}

//Makes you leave the title screen when ENTER key is pressed
function keyPressed(){
    if (keyCode === ENTER) {
        titleScreen = false;
        score = 0;
    }else if(key === 'h'){
        titleScreen = false;
        score = 0;
        rectangle.w = 50;
    }
}

function draw(){
    background("black");
    strokeWeight(0);
    rectangle.update();

    //runs the update & senseBall functions for each block object in the array
    for(let i = 0; i<blocks.length; i++){
        blocks[i].update();
        blocks[i].senseBall(ball.x,ball.y,ball.d,ball.blockCollide);
    }

    //Runs the update function for the ball object only when player is in game
    if(inGame){
        ball.update();
    }

    //Triggers the countdown function only when it should be happening
    if(countDown && !titleScreen){
        levelCountdown();
    }

    //Contains text used on the title screen
    if(titleScreen){
        textSize(50);
        fill("white")
        textAlign(CENTER);
        text("Logan's Gravitational Breakout", 400, 250);
        textSize(32);
        fill("white")
        textAlign(CENTER);
        text("Press Enter to Start", 400, 350);
    }


    //Runs all of the collision related functions for the ball object
    ball.lose();
    ball.collideX(width);
    ball.collideY();
    ball.collidePaddle(rectangle.x,rectangle.y,rectangle.w,rectangle.h);
    ball.collideBlock();

    //runs levelClearCheck function only when the player isn't on the titlescreen
    if(!titleScreen){
        levelCreator.levelClearCheck();
    }
    
    //Text for the scoreboard, current level, & lives counter
    textSize(32);
    fill("white");
    textAlign(LEFT);
    text('Score: ' + score, 10, 30);

    textSize(32);
    fill("white");
    textAlign(LEFT);
    text('Level: ' + levelCreator.currentLevel, 350, 30);

    textSize(32);
    fill("white");
    textAlign(LEFT);
    text('Lives: ' + lives, 660, 30);

}