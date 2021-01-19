const canvas = document.getElementById("cnvs");
let timeIngame = 0
let lose = false
let killBonus = false
let isBonus = false

const gameState = {};

function onMouseMove(e) {
    if (lose)
    {
        return
    }
    gameState.pointer.x = e.pageX;
    gameState.pointer.y = e.pageY
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPlatform(context)
    drawBall(context)
    drawTime(context)
    drawBonus(context)
}

function update(tick) {

    const vx = (gameState.pointer.x - gameState.player.x) / 10
    gameState.player.x += vx
    if (gameState.ball.y > canvas.height)
    {
        stopGame(gameState.stopCycle)
        lose = true
    }

    moveBall()
    moveBonus()
}

function moveBall()
{
    gameState.ball.x += gameState.ball.vx
    gameState.ball.y += gameState.ball.vy
    collisionPlatform()
    collisionUpside()
    collisionRightside()
    collisionLeftside()
}

function collisionPlatform()
{
    if (canvas.height - gameState.player.height <= gameState.ball.y + gameState.ball.radius
         && gameState.player.x - gameState.player.width / 2 < gameState.ball.x
          && gameState.ball.x < gameState.player.x + gameState.player.width / 2
           && gameState.ball.vy > 0
            && gameState.ball.y < canvas.height) 
    {
        gameState.ball.vy *= -1
    }
}

function collisionUpside() 
{
    if (gameState.ball.y <= 0)
    {
        gameState.ball.vy *= -1
    }
}

function collisionRightside() 
{
    if (gameState.ball.x > canvas.width)
    {
        gameState.ball.vx *= -1
    }
}

function collisionLeftside()
{
    if (gameState.ball.x <= 0)
    {
        gameState.ball.vx *= -1
    }
}

function generateBonus()
{
    gameState.bonus.x = getRandomInRange(0,canvas.width)
    gameState.bonus.y = getRandomInRange(0, canvas.height / 3)
    gameState.bonus.vx = getRandomInRange(-2, 2)
    gameState.bonus.vy = getRandomInRange(5, 10)
}

function moveBonus()
{
    gameState.bonus.x += gameState.bonus.vx
    gameState.bonus.y += gameState.bonus.vy
    collisionBonus()
}

function collisionBonus()
{
    if(gameState.bonus.x + gameState.bonus.width >= canvas.width)
    {
        gameState.bonus.vx *= -1
    }
    if(gameState.bonus.x - gameState.bonus.width <= 0)
    {
        gameState.bonus.vx *= -1
    }
    if(gameState.bonus.y + gameState.bonus.height >= canvas.height - gameState.player.height
        && killBonus == false && isBonus == true)
    {
        killBonus = true
        isBonus = false
    }
}

function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function stopGame(handle) {
    window.cancelAnimationFrame(handle);

}

function drawPlatform(context) {
    const {x, y, width, height} = gameState.player;
    context.beginPath();
    context.rect(x - width / 2, y - height / 2, width, height);
    context.arc(gameState.player.x, gameState.player.y, 5, 0, 2 * Math.PI)
    context.fillStyle = "#FF0000";
    context.fill();
    context.closePath();
    context.beginPath();
    context.arc(gameState.player.x, gameState.player.y, 5, 0, 2 * Math.PI)
    context.fillStyle = "#000000";
    context.fill();
    context.closePath();
}

function drawBall(context) {
    const {x, y, radius} = gameState.ball;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = "#0000FF";
    context.fill();
    context.closePath();
}

function drawTime(context) {
    context.beginPath();
    context.strokeStyle = "#000000";
    context.lineWidth = "1";
    context.font = "italic 30pt Impact";
    context.shadowColor = "8b00ff";
    context.shadowOffsetX = 5; 
    context.shadowOffsetY = 5;
    context.shadowBlur = 10;
    context.strokeText(timeIngame, 20, 20, 50);
    context.textBaseline = "top";
    context.closePath();
}

function drawBonus(context)
{
    if(isBonus)
    {
        context.beginPath() 
        context.strokeStyle = "magenta";
        context.lineWidth = "10";
        context.moveTo(gameState.bonus.x - gameState.bonus.width, gameState.bonus.y)
        context.lineTo(gameState.bonus.x + gameState.bonus.width, gameState.bonus.y)
        context.stroke()
        context.moveTo(gameState.bonus.x, gameState.bonus.y - gameState.bonus.height)
        context.lineTo(gameState.bonus.x, gameState.bonus.y + gameState.bonus.height)
        context.stroke()
        context.closePath()
    }
}

function updateTime()
{
    console.log(timeIngame)
    timeIngame++
    
    if (timeIngame % 5 == 0)
    {
        gameState.ball.vx += gameState.ball.vx / 10
        gameState.ball.vy += gameState.ball.vy / 10
    }

    if(killBonus)
    {
        timeIngame +=15
        killBonus = false
    }

    if (timeIngame % 15 == 0)
    {
        generateBonus()
        isBonus = true

    }
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15; //ms
    setInterval(updateTime, 1000)

    const platform = {
        width: 400,
        height: 50,
    };

    gameState.player = {
        x: 100,
        y: canvas.height - platform.height / 2,
        width: platform.width,
        height: platform.height
    };
    gameState.pointer = {
        x: 0,
        y: 0,
    };
    gameState.ball = {
        x: canvas.width / 4,
        y: 50,
        radius: 25,
        vx: 3,
        vy: 3
    };
    gameState.bonus = {
        x: 0,
        y: 0,
        width: 20,
        height: 20,
        vx: 0,
        vy: 0

    }
}

function getRandomInRange(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

setup();
run();
