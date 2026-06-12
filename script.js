const gameBoard = document.querySelector('#gameBoard');
const context = gameBoard.getContext('2d');

const gameScore = document.querySelector('#gameScore');

const resetBtn = document.querySelector('#resetBtn');
const pauseBtn = document.querySelector('#pauseBtn');
const clearScoreBtn = document.querySelector('#clearScoreBtn');

const changeSkinSelect = document.querySelector('#changeSkinSelect');

const leftBtn = document.querySelector('#leftBtn');
const rightBtn = document.querySelector('#rightBtn');
const shootBtn = document.querySelector('#shootBtn');

const unitSize = 25;

const BACKGROUNDS = [
    "Assets/Images/Backgrounds/Default/space-background-0.png",
    "Assets/Images/Backgrounds/Default/space-background-1.png",
    "Assets/Images/Backgrounds/Default/space-background-2.png",
    "Assets/Images/Backgrounds/Default/space-background-3.mp4",
    "Assets/Images/Backgrounds/Default/space-background-4.png",
    "Assets/Images/Backgrounds/Default/space-background-5.gif",
    "Assets/Images/Backgrounds/Special/Summer/special-background-0.png",
    "Assets/Images/Backgrounds/Special/Summer/special-background-1.png"
];

const backGroundVideo = document.createElement("video");
backGroundVideo.src = BACKGROUNDS[3];

backGroundVideo.playsInline = true;
backGroundVideo.loop = true;
backGroundVideo.muted = true;

let videoReady = true;

const backGroundImage = new Image();
backGroundImage.src = BACKGROUNDS[1];

const LEVEL_SETTINGS = [
    {
        scoreThreshold: 0,
        backgroundSrc: BACKGROUNDS[4],
        enemySpeed: 6.0,
        shootCooldown: 250,
        bossLevel: false
    },
    {
        scoreThreshold: 500,
        backgroundSrc: BACKGROUNDS[7], 
        enemySpeed: 8.0,               
        shootCooldown: 250,
        bossLevel: false
    },
    {
        scoreThreshold: 1000,
        backgroundSrc: BACKGROUNDS[1], 
        enemySpeed: 10.0,               
        shootCooldown: 250,
        bossLevel: true
    },
    {
        scoreThreshold: 1500,
        backgroundSrc: BACKGROUNDS[2], 
        enemySpeed: 12.0,               
        shootCooldown: 200,
        bossLevel: false
    },
    {
        scoreThreshold: 2000,
        backgroundSrc: BACKGROUNDS[3],
        enemySpeed: 14.0,              
        shootCooldown: 200,
        bossLevel: false
    },
    {
        scoreThreshold: 2500,
        backgroundSrc: BACKGROUNDS[6],
        enemySpeed: 18.0,              
        shootCooldown: 175,
        bossLevel: false
    },
    {
        scoreThreshold: 3000,
        backgroundSrc: BACKGROUNDS[5],
        enemySpeed: 20.0,              
        shootCooldown: 175,
        bossLevel: true
    },
];

const SHIP_SKINS = [
    "Assets/Images/Ships/spaceship.png",
    "Assets/Images/Ships/spaceship-1.png",
    "Assets/Images/Ships/spaceship-2.png",
    "Assets/Images/Ships/spaceship-3.png"
];

const IMAGES = {
    ship: SHIP_SKINS[0],
    enemyShip: "Assets/Images/Ships/enemy-spaceship.png",
    explosion: "Assets/Images/Effects/explosion.png",
    shipShoot: "Assets/Images/Effects/ship-muzzle-flash.png",
    bossShoot: "Assets/Images/Effects/boss-muzzle-flash.png",
    meteorite: "Assets/Images/Entities/meteorite.png",
    planet: "Assets/Images/Entities/planet.png",
    beachball: "Assets/Images/Entities/Special/Summer/beach-ball.png",
    melon: "Assets/Images/Entities/Special/Summer/melon.png"
};

const loadedImages = {};

const shipImage = new Image();
shipImage.src = SHIP_SKINS[0];

const enemyShip = new Image();
enemyShip.src = "Assets/Images/Ships/enemy-spaceship.png";

const SOUNDS = {
    shooting: "Assets/Sounds/shoot.mp3",
    explosion: "Assets/Sounds/explosion.mp3",
    gameOver: "Assets/Sounds/game-over.mp3",
    special: "Assets/Sounds/special-sound.mp3"
};

const loadedSounds = {};

const COLORS = {
    shipBullet: "#00E5FF",
    bossBullet: "#FF6D00",
    levelText: {
        default: "#00FFFF",
        special: "#FF00FF"
    },
    hud: "#FFFFFF",
    hudHighlight: "#FFD700",
    status: {
        optimal: "#00FF00", 
        warning: "#FFD700",
        critical: "#FF4500"
    },
    dark: "#000000"
}

let running = false;
let paused = false;

let redrawFrame = true;

let buttonPressed = {
    left: false,
    right: false,
    shoot: false
};

let currentLevel = 1;

let levelUpMessage = null;
let levelUpTimer = null;

let merryChristmasTimer = 0;

let score = 0;

let ship = {
    x: 0,
    y: 0,
    width: unitSize * 3,
    height: unitSize * 3,
    canShoot: true,
    shootCooldown: 250,
    xVelocity: 0,
    touchXVelocity: 0
}

let bulletArray = [];

let bulletVelocityY = 20;
let bulletDamage = 25;

let shootFlashes = [];

let enemyArray = [];

let bossEnemy = null;
let bossDefeated = false;

let enemyVelocityY = 4.5;
let bossVelocityX = 5;

let enemyWidth = unitSize * 3;
let enemyHeight = unitSize * 3;

let explosionArray = [];

let animationFrameId;

let enemyInterval;

let enemySpawnInterval = 1500;

let lastTime = 0;

let fps = 0;

function resizeCanvas() {
    gameBoard.width = Math.min(window.innerWidth * 0.95, 500); 
    gameBoard.height = Math.min(window.innerHeight * 0.7, 550); 
}

function resizeShipPosition() {
    ship.x = gameBoard.width / 2 - ship.width / 2;
    ship.y = gameBoard.height - ship.height * 1.5;
}

function loadAssets(callBack) {
    let totalAssets = Object.keys(IMAGES).length + 1;
    let loadedCount = 0;

    function checkLoaded() {
        loadedCount++;
        if(loadedCount === totalAssets) callBack();
    }

    for(const key in IMAGES) {
        loadedImages[key] = new Image();
        loadedImages[key].src = IMAGES[key];
        loadedImages[key].onload = checkLoaded;
        loadedImages[key].onerror = checkLoaded;
    }

    backGroundImage.onload = checkLoaded;
    backGroundImage.onerror = checkLoaded;

    for(const key in SOUNDS){
        loadedSounds[key] = new Audio(SOUNDS[key]);
    }
}

window.addEventListener("resize", () => {
    resizeCanvas();
    resizeShipPosition();
});

window.addEventListener("load", () => {
    resizeCanvas();
    resizeShipPosition();
    applyLevelSettings(0);
    displayScores();

    const savedSkin = Number(localStorage.getItem("selectedSkin"));

    if(!isNaN(savedSkin)){
        changeSkinSelect.value = savedSkin;
        ship.src = SHIP_SKINS[savedSkin];
    }

    loadAssets(() => {
        gameStart();
    })
});

window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault(); 
    }
    changeDirection(event);
});

window.addEventListener("keyup", stopShip);

window.addEventListener("keyup", shootBullet);

window.addEventListener("keydown", (event) => {
    if(event.code === "KeyP") {
        togglePause();
    }
});

function updateVelocity() {
    ship.touchXVelocity = 0;
    if(buttonPressed.left) ship.touchXVelocity -= unitSize;
    if(buttonPressed.right) ship.touchXVelocity += unitSize;
    if(buttonPressed.shoot && ship.canShoot) shootBullet({ code: 'Space' });
}

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    buttonPressed.left = true;
    updateVelocity();
});
leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    buttonPressed.left = false;
    updateVelocity();
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    buttonPressed.right = true;
    updateVelocity();
});
rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    buttonPressed.right = false;
    updateVelocity();
});

shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    buttonPressed.shoot = true;
    updateVelocity();
});
shootBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    buttonPressed.shoot = false;
    updateVelocity();
});

function changeSkin(index) {
    const newShip = new Image();
    newShip.src = SHIP_SKINS[index];

    newShip.onload = () => {
        ship.src = SHIP_SKINS[index];
        localStorage.setItem("selectedSkin", index);
    }
}

changeSkinSelect.addEventListener("change", function() {
    changeSkin(this.value);
});

resetBtn.addEventListener("click", resetGame);

pauseBtn.addEventListener("click", togglePause);

clearScoreBtn.addEventListener("click", clearScore);

function gameStart(){
    running = true;
    gameScore.textContent = score;

    resizeShipPosition();

    startIntervals();

    document.querySelector('#loadingScreen').style.display = 'none';

    animationFrameId = requestAnimationFrame(nextTick); 
}
function startIntervals() {
    if(!enemyInterval) {
        enemyInterval = setInterval(generateEnemy, enemySpawnInterval);
    }
}
function clearIntervals() {
    if(enemyInterval){
        clearInterval(enemyInterval);
        enemyInterval = null; 
    }
}
function nextTick(timeStamp) {
    if(!lastTime) lastTime = timeStamp;
    const deltaTime = (timeStamp - lastTime) / 1000;
    lastTime = timeStamp;

    if(deltaTime) fps = 1 / deltaTime;

    if(running && !paused){
        moveShip(deltaTime);
        moveEnemies(deltaTime);
        moveBullets(deltaTime);
        checkUpgrades();
        checkCollisions();

        if(redrawFrame) {
            context.shadowBlur = 0;
            drawBackGround();
            drawShootFlash();
            drawExplosion();
            
            setShadows();
            drawShip();
            drawBullets();
            drawEnemies();
            drawLevelUpMessage();
            drawHud();

            redrawFrame = false;
        }
        
        animationFrameId = requestAnimationFrame(nextTick);
    }
    else {
        drawBackGround();
        drawShip();
        drawBullets();
        drawEnemies();
        drawHud();

        if(!running) {
            drawGameOverScreen();
        } else if (paused) {
            drawPauseScreen();
        }
    }
}
function setShadows() {
    context.shadowColor = COLORS.dark;
    context.shadowBlur = 15;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
}
function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ value: score, date: new Date().toLocaleString() });
    localStorage.setItem('scores', JSON.stringify(scores));
}
function getMaxScore() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    if(scores.length === 0) return 0;
    return Math.max(...scores.map(s => s.value));
}
function displayScores() {
    const scoreTableBody = document.querySelector('#scoreTable tbody');
    scoreTableBody.innerHTML = '';

    const scores = JSON.parse(localStorage.getItem('scores')) || [];

    scores.sort((a, b) => b.value - a.value);

    scores.forEach(s => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${s.value}</td><td>${s.date}</td>`;
        scoreTableBody.appendChild(row);
    });
}
function resumeGame() {
    if(paused) {
        paused = false;

        lastTime = 0;

        startIntervals();

        animationFrameId = requestAnimationFrame(nextTick);
    }
}
function togglePause() {
    if(!running) return;

    if(paused){
        pauseBtn.textContent = "Pause";
        resumeGame();
    } else {
        paused = true;
        pauseBtn.textContent = "Resume";

        clearIntervals();
    }
}
function clearScore() {
    localStorage.removeItem('scores');
    displayScores();
}
function moveShip(deltaTime){
    if (isNaN(ship.x)) {
        ship.x = gameBoard.width / 2 - ship.width / 2;
    }

    const prevX = ship.x;

    ship.x += (ship.xVelocity + ship.touchXVelocity) * deltaTime * 15;

    if(ship.x < 0){
        ship.x = 0;
    }else if(ship.x + (ship.width) > gameBoard.width){
        ship.x = gameBoard.width - (ship.width);
    }

    if(ship.x !== prevX) redrawFrame = true;
}
function drawGameOverScreen() {
    console.log("Game over!");

    if(score > 0) {
        saveScore(score);
        displayScores();
    }
        
    context.fillStyle = COLORS.hud;
    context.font = "bold 48px Arial"
    context.textAlign = "center";
    context.textBaseline = "middle";
    
    context.fillText("Game over!", gameBoard.width / 2, gameBoard.height / 2);

    const clonedGameOverSound = loadedSounds['gameOver'].cloneNode();
    clonedGameOverSound.play();
}
function drawPauseScreen(){
    context.fillStyle = COLORS.hud;
    context.font = "bold 48px Arial"
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText("Game paused!", gameBoard.width / 2, gameBoard.height / 2);
}
function drawHud() {
    context.fillStyle = COLORS.hud;
    context.font = "20px Arial";
    context.textAlign = "left";
    context.textBaseline = "top";

    context.fillText("Level " + currentLevel, 10, 10);

    if(fps >= 50) context.fillStyle = COLORS.status.optimal;
    else if(fps >= 30) context.fillStyle = COLORS.status.warning;
    else context.fillStyle = COLORS.status.critical;

    context.fillText("FPS " + fps.toFixed(2), 10, 35);

    context.fillStyle = COLORS.hud;

    context.textAlign = "right";
    
    context.fillText("Best score: " + getMaxScore(), gameBoard.width - 10, 10);

    if(score >= getMaxScore()) {
        context.fillStyle = COLORS.hudHighlight;
    } else {
        context.fillStyle = COLORS.hud;
    }

    context.fillText("Score: " + score, gameBoard.width - 10, 35);
}
function showLevelUpMessage(level) {
    levelUpMessage = "LEVEL " + level + "!";
    clearTimeout(levelUpTimer);
    levelUpTimer = setTimeout(() => {
        levelUpMessage = null;
    }, 1000);
}
function drawLevelUpMessage() {
    if(levelUpMessage) {
        context.fillStyle = LEVEL_SETTINGS[currentLevel - 1].bossLevel ? COLORS.levelText.special : COLORS.levelText.default;
        context.font = "bold 48px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillText(levelUpMessage, gameBoard.width / 2, gameBoard.height / 2);
    }
}
// Winter season
function drawMerryChristmasMessage() {
    if(merryChristmasTimer > 0){
        context.fillStyle = COLORS.status.optimal;
        context.font = "bold 42px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillText("MERRY CHRISTMAS🎄", gameBoard.width / 2, gameBoard.height / 2);   

        merryChristmasTimer--;
    }
}
function drawShip(){
    context.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height); 
}
function drawBackGround(){
    if(currentLevel === 5){
        if(videoReady){
            if(backGroundVideo.paused) backGroundVideo.play();
            context.drawImage(backGroundVideo, 0, 0, gameBoard.width, gameBoard.height);
        } else {
            context.fillStyle = COLORS.dark;
            context.fillRect(0, 0, gameBoard.width, gameBoard.height);
        }
    } else {
        context.drawImage(backGroundImage, 0, 0, gameBoard.width, gameBoard.height);
    }
}
function drawEnemies(){
    for(let i = 0; i < enemyArray.length; i++){
        let enemy = enemyArray[i];
        if(enemy.alive){
            switch(enemy.type) {
                case 'enemy':
                    context.drawImage(loadedImages['enemyShip'], enemy.x, enemy.y, enemy.width, enemy.height);
                    break;
                case 'boss':
                    context.drawImage(loadedImages['enemyShip'], enemy.x, enemy.y, enemy.width, enemy.height);
                    break;
                case 'meteorite':
                    context.save(); 
                    context.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    context.rotate(enemy.rotation); 
                    context.drawImage(loadedImages['meteorite'], -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
                    context.restore();
                    break;
                case 'planet': 
                    context.drawImage(loadedImages['planet'], enemy.x, enemy.y, enemy.width, enemy.height);
                    break;
                case 'beachball':
                    context.drawImage(loadedImages['beachball'], enemy.x, enemy.y, enemy.width, enemy.height);
                    break;
                case 'melon':
                    context.drawImage(loadedImages['melon'], enemy.x, enemy.y, enemy.width, enemy.height);
                    break;
            }

            drawHealth(enemy);
        }
    }
}
function drawHealth(enemy) {
    context.font = "20px Arial";
    context.fillStyle = enemy.health >= Math.floor(enemy.maxHealth / 2) ? COLORS.status.optimal : COLORS.status.critical;
    context.fillText(enemy.health, enemy.x + (enemy.width / 2 + 10), enemy.y + enemy.height);
}
function drawExplosion(){
    for(let i = explosionArray.length - 1; i >= 0; i--) {
        const exp = explosionArray[i];

        context.drawImage(loadedImages['explosion'], exp.x, exp.y, exp.width, exp.height);

        exp.timer--;

        if(exp.timer <= 0){
            explosionArray.splice(i, 1);
        }
    }
}
function drawShootFlash() {
    for (let i = 0; i < shootFlashes.length; i++) {
        let shootFlash = shootFlashes[i];
        context.drawImage(loadedImages[shootFlash.type == 'boss' ? 'bossShoot' : 'shipShoot'], shootFlash.x, shootFlash.y, unitSize * 1.5, unitSize * 2);
        shootFlash.timer--;

        if(shootFlash.timer <= 0) {
            shootFlashes.splice(i, 1)
        }
    }
}
function moveEnemies(deltaTime) {
    for(let i = 0; i < enemyArray.length; i++){
        let enemy = enemyArray[i];
        if(enemy.alive && enemy.type == 'boss'){
            const prevX = enemy.x;
            enemy.x += bossVelocityX * deltaTime * 15;

            if (enemy.x !== prevX) redrawFrame = true;

            if (enemy.x >= gameBoard.width - enemy.width) {
                enemy.x = gameBoard.width - enemy.width;

                bossVelocityX = -Math.abs(bossVelocityX);
            }

            if (enemy.x <= 0) {
                enemy.x = 0;

                bossVelocityX = Math.abs(bossVelocityX);
            }

            shootBullet({code: 'Space'}, 'boss')
        } else {
            const prevY = enemy.y;
            enemy.y += enemyVelocityY * deltaTime * 15;

            if (enemy.y !== prevY) redrawFrame = true;

            if(enemy.type === 'meteorite') {
                enemy.rotation += enemy.rotationSpeed * deltaTime * 5;
            }
        }
    }

    enemyArray = enemyArray.filter(a => a.alive && a.y < gameBoard.height);
}
function changeDirection(event){
    const keyPressed = event.keyCode;

    const LEFT = 37;
    const RIGHT = 39;

    switch(true){
        case(keyPressed === LEFT):
        ship.xVelocity = -unitSize;
        break;
        case(keyPressed === RIGHT):
        ship.xVelocity = unitSize;
        break;
    }
}
function stopShip(event){
    const keyPressed = event.keyCode;

    const LEFT = 37;
    const RIGHT = 39;

    switch(true){
        case(keyPressed === LEFT):
        ship.xVelocity = 0;
        break;
        case(keyPressed === RIGHT):
        ship.xVelocity = 0;
        break;
    }
}
function shootBullet(event, name='ship') {
    if (event.code !== "Space" || !running || paused) return;

    if ((name === 'ship' && !ship.canShoot) ||
        (name === 'boss' && !bossEnemy.canShoot)) return

    if (name === 'boss' && bossEnemy === null) return

    if (name === 'ship') {
        ship.canShoot = false;

        setTimeout(() => {
            ship.canShoot = true;
        }, ship.shootCooldown);
    }

    if (name == 'boss') {
        bossEnemy.canShoot = false;

        setTimeout(() => {
            if (bossEnemy !== null) {
                bossEnemy.canShoot = true;
            }
        }, bossEnemy.shootCooldown);
    }

    createBullet(name);
}
function createBullet(name) {
    let isBoss = name === 'boss';
    let entity = isBoss ? bossEnemy : ship;
    let direction = isBoss ? 1 : -1;

    let bullet = {
        x: entity.x + (isBoss ? entity.width / 2: unitSize + 11),
        y: entity.y + (isBoss ? entity.height : 0),
        width: unitSize / 8,
        height: unitSize / 2,
        direction: direction,
        color: isBoss ? COLORS.bossBullet : COLORS.shipBullet
    };

    const clonedShootingSound = loadedSounds['shooting'].cloneNode();
    clonedShootingSound.play();

    shootFlashes.push({
        x: entity.x + entity.width / 2 - (unitSize * 1.5) / 2,
        y: isBoss ? entity.y + entity.height : entity.y - 50,
        type: isBoss ? 'boss' : 'ship',
        timer: 2
    });

    bulletArray.push(bullet);

    redrawFrame = true;
}
function moveBullets(deltaTime) {
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        let prevY = bullet.y;
        bullet.y += bulletVelocityY * bullet.direction * deltaTime * 15;
        
        if (prevY !== bullet.y) redrawFrame = true;
    }
    bulletArray = bulletArray.filter(b => b.y + b.height > 0);
}
function drawBullets(deltaTime){
    for(let i = 0; i < bulletArray.length; i++){
        let bullet = bulletArray[i];
        context.fillStyle = bullet.color;
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}
function generateEnemy(){
    generateBossEnemy();

    if (bossEnemy !== null) return;

    let randomX = Math.floor(Math.random() * (gameBoard.width - enemyWidth));

    const typeChance = Math.random();
    let enemy;

    if(typeChance < 0.01){
        enemy = {
            x: randomX,
            y: 0,
            width: enemyWidth,
            height: enemyHeight,
            alive: true,
            type: 'planet',
            health: 15,
            maxHealth: 15,
            points: 100
        }
    } else if (typeChance < 0.05) {
        enemy = {
            x: randomX,
            y: 0,
            width: enemyWidth - 15,
            height: enemyHeight - 15,
            alive: true,
            type: 'melon',
            health: 20,
            maxHealth: 20,
            points: 100,
        };
    } else if (typeChance < 0.25) {
        enemy = {
            x: randomX,
            y: 0,
            width: enemyWidth - 15,
            height: enemyHeight - 15,
            alive: true,
            type: 'beachball',
            health: 30,
            maxHealth: 30,
            points: 50,
        };
    } else if(typeChance < 0.35) {
        const scale = 0.5 + Math.random() * 0.85;

        enemy = {
            x: randomX,
            y: 0,
            width: enemyWidth * scale,
            height: enemyHeight * scale,
            alive: true,
            type: 'meteorite',
            health: Math.floor(20 * scale),
            maxHealth: Math.floor(20 * scale),
            scale: scale,
            points: Math.floor(5 * scale),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 2
        };

        if(scale > 1) enemy['easterEgg'] = ':)';
    }
    else {
        enemy = {
            x: randomX,
            y: 0,
            width: enemyWidth,
            height: enemyHeight,
            alive: true,
            type: 'enemy',
            health: 35,
            maxHealth: 35,
            points: 10
        }
    }

    if(enemy){
        enemyArray.push(enemy);
    }
}
function generateBossEnemy() {
    if (bossEnemy !== null) {
        return;
    }

    if (LEVEL_SETTINGS[currentLevel - 1].bossLevel) {
        enemyArray = [];

        let bossWidth = enemyWidth * 2;
        let bossHeight = enemyHeight * 2;

        bossEnemy = {
            x: gameBoard.width / 2 - bossWidth / 2,
            y: gameBoard.width / 4 - bossHeight / 2,
            width: bossWidth,
            height: bossHeight,
            canShoot: true,
            shootCooldown: 1000,
            alive: true,
            type: 'boss',
            health: 250,
            points: 500
        };

        enemyArray.push(bossEnemy);
    }
}
function checkCollisions() {
    for(let i = bulletArray.length - 1; i >= 0; i--) {
        let bullet = bulletArray[i];
        if (bullet.direction === 1) {
            if(
                bullet.y < ship.y + ship.height && 
                bullet.y + bullet.height > ship.y &&
                bullet.x < ship.x + ship.width &&
                bullet.x + bullet.width > ship.x
                ){
                    running = false;
                }
        } else if (bullet.direction === -1) {
            for (let j = enemyArray.length - 1; j >= 0; j--) {
                let enemy = enemyArray[j];
                if(enemy.alive &&
                    bullet.y < enemy.y + enemy.height && 
                    bullet.y + bullet.height > enemy.y &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x
                ){
                    enemy.health -= bulletDamage;

                    if (enemy.health <= 0) {
                        enemy.alive = false;

                        if (enemy.type === 'boss') {
                            bossDefeated = true;
                            bossEnemy = null;
                        }

                        if(enemy.type === 'special' || enemy.type === 'melon' || enemy.type === 'beachball'){
                            const clonedSpecialSound = loadedSounds['special'].cloneNode();
                            clonedSpecialSound.play();
                        } else {
                            const clonedExplosionSound = loadedSounds['explosion'].cloneNode();
                            clonedExplosionSound.play();
                        }

                        explosionArray.push({
                            x: enemy.x,
                            y: enemy.y,
                            width: enemy.width,
                            height: enemy.height,
                            timer: 2
                        });

                        score += enemy.points;
                        gameScore.textContent = score;
                    }

                    bulletArray.splice(i, 1);
            
                    break;
                }
            }
        }
    }

    for (let i = enemyArray.length - 1; i >= 0; i--) {
        let enemy = enemyArray[i];

        if (!enemy.alive && enemy.y < gameBoard.height) {
            enemyArray.splice(i, 1);
            continue;
        }

        if(enemy.y + enemy.height >= gameBoard.height && enemy.type !== 'meteorite'){
            running = false;
        }

        if(
            enemy.x < ship.x + ship.width &&
            enemy.x + enemy.width > ship.x &&
            enemy.y < ship.y + ship.height &&
            enemy.y + enemy.height > ship.y
            ){
            running = false;
        }
    }
}
function checkUpgrades() {
    const nextLevelIndex = currentLevel;
    
    if (currentLevel > LEVEL_SETTINGS.length) return;

    let levelUp = false;

    if (LEVEL_SETTINGS[currentLevel - 1].bossLevel) {
        if (bossDefeated) {
            levelUp = true;
        }
    } else {
        const nextLevelSettings = LEVEL_SETTINGS[nextLevelIndex];
        if (score >= nextLevelSettings.scoreThreshold) {
            levelUp = true;
        }
    }

    if (levelUp) {
        applyLevelSettings(nextLevelIndex);
    }
}
function applyLevelSettings(levelIndex) {
    const settings = LEVEL_SETTINGS[levelIndex];

    currentLevel = levelIndex + 1;
    
    bossDefeated = false;

    showLevelUpMessage(currentLevel);

    enemyVelocityY = settings.enemySpeed;
    shootCooldown = settings.shootCooldown;

    enemySpawnInterval -= 100;

    if (settings.bossLevel) {
        generateBossEnemy();
    }

    if(settings.backgroundSrc.endsWith('.mp4')){
        this.videoReady = false;
        backGroundVideo.src = settings.backgroundSrc; 
        backGroundVideo.load();

        backGroundVideo.oncanplay = () => {
            this.videoReady = true;
        }
    } else {
        backGroundImage.src = settings.backgroundSrc;

        if(!backGroundVideo.paused) {
            backGroundVideo.pause();
            backGroundVideo.currentTime = 0;
        }
    }
}
function resetGame(){
    document.querySelector('#loadingScreen').style.display = 'flex';

    setTimeout(() => {
        running = false;
        paused = false;
        redrawFrame = true;

        bulletArray = [];
        enemyArray = [];

        bossEnemy = null;

        score = 0;
        gameScore.textContent = score;

        pauseBtn.textContent = "Pause";

        if(!backGroundVideo.paused){
            backGroundVideo.pause();
            backGroundVideo.currentTime = 0;
        }

        enemySpawnInterval = 1500;

        clearIntervals();

        cancelAnimationFrame(animationFrameId);

        lastTime = 0;

        applyLevelSettings(0);
        running = true;
        gameStart();
    }, 300);
}
