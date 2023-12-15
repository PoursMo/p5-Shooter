let bullets = new Array();
let lasers = new Array();
let enemyShips = new Array();
let waves = new Array();
let experiences = new Array();
let pickUps = new Array();
let stars = new Array();
let spriteAnimations = new Array();
bossKilled = false;

let player;
let playerStats;
let isGameRunning = false;
let isGameOver = false;
let gameTimer;
let timeGameStart;
let wavesManager;
let ui;

let shipsSpriteDown;
let shipsSpriteUp;
let asteroid1Sprites = new Array();
let asteroid2Sprites = new Array();
let asteroidsSprites = new Array();
let playerSprite;
let playerEnginesSprite;
let pathfinderSprite;
let ravenSprite;
let hawkSprite;
let bomberSprite;
let zapperSprite;
let bossSprite;
let bubbleExplosionSprites = new Array();
let bubbleExplosionSpritesSmall = new Array();
let bombPickUpSprite;
let healthPickUpSprite;
let warningSprite;
let pixelFont;

let devMode = false;

function preload() {
  shipsSpriteDown = loadImage("./assets/ships_looking_down.png");
  shipsSpriteUp = loadImage("./assets/ships_looking_up.png");
  for (let i = 1; i <= 10; i++) {
    bubbleExplosionSprites.push(loadImage("./assets/bubble_explosion/bubble_explo" + i + ".png"));
    bubbleExplosionSpritesSmall.push(
      loadImage("./assets/bubble_explosion/bubble_explo" + i + ".png")
    );
  }
  for (let i = 1; i <= 32; i++) {
    asteroid1Sprites.push(loadImage("./assets/asteroid1/aster" + i + ".png"));
    asteroid2Sprites.push(loadImage("./assets/asteroid2/aster" + i + ".png"));
  }
  bombPickUpSprite = loadImage("./assets/pickup_bomb.png");
  healthPickUpSprite = loadImage("./assets/pickup_health.png");
  warningSprite = loadImage("./assets/warning.png");
  pixelFont = loadFont("./assets/retro_gaming.ttf");
}

function setup() {
  frameRate(60);

  //Sprites
  for (const bubbleExplosionSprite of bubbleExplosionSprites) {
    bubbleExplosionSprite.resize(0, 60);
  }
  for (const bubbleExplosionSprite of bubbleExplosionSpritesSmall) {
    bubbleExplosionSprite.resize(0, 10);
  }
  for (let index = 0; index < asteroid1Sprites.length; index++) {
    asteroid1Sprites[index].resize(0, 40);
    asteroid2Sprites[index].resize(0, 40);
  }
  asteroidsSprites.push(asteroid1Sprites);
  asteroidsSprites.push(asteroid2Sprites);
  playerSprite = shipsSpriteUp.get(64, 72, 128, 100);
  playerSprite.resize(0, 35);
  playerEnginesSprite = shipsSpriteUp.get(328, 168, 112, 52);
  playerEnginesSprite.resize(0, 18.2);
  hawkSprite = shipsSpriteDown.get(336, 1612, 96, 136);
  hawkSprite.resize(0, 40);
  ravenSprite = shipsSpriteDown.get(336, 1860, 96, 136);
  ravenSprite.resize(0, 40);
  pathfinderSprite = shipsSpriteDown.get(336, 856, 96, 84);
  pathfinderSprite.resize(0, 30);
  bomberSprite = shipsSpriteDown.get(288, 1336, 192, 128);
  bomberSprite.resize(0, 40);
  zapperSprite = shipsSpriteDown.get(320, 2876, 128, 132);
  zapperSprite.resize(0, 40);
  bossSprite = shipsSpriteDown.get(284, 2360, 200, 164);
  bossSprite.resize(0, 300);

  //Canvas
  createCanvas(400, 600);

  //Modes
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  imageMode(CENTER);

  //Game Setup
  ui = new UI();
  ui.showPlayButton();
  for (let index = 0; index < 50; index++) {
    stars.push(new Star());
  }
}

function gameOver() {
  isGameRunning = false;
  isGameOver = true;
  ui.showPlayButton();
}

function newGame() {
  ui.hidePlayButton();
  bullets = new Array();
  lasers = new Array();
  enemyShips = new Array();
  waves = new Array();
  experiences = new Array();
  pickUps = new Array();
  spriteAnimations = new Array();
  playerStats = new PlayerStats();
  player = new PlayerShip(playerSprite);
  playerStats.levelUp();
  wavesManager = new WaveManager();
  bossKilled = false;
  timeGameStart = millis();
  gameTimer = 0;
  isGameRunning = true;
  isGameOver = false;
}

let currentIndex = 0;
function draw() {
  background(0);
  for (const star of stars) {
    star.update();
  }
  if (isGameRunning) {
    wavesManager.update();
    player.update();
    let enemyShipsIndex = enemyShips.length;
    while (enemyShipsIndex--) {
      enemyShips[enemyShipsIndex].update();
    }
    for (const pickUp of pickUps) {
      pickUp.update();
    }
    let lasersIndex = lasers.length;
    while (lasersIndex--) {
      lasers[lasersIndex].update();
    }
    let bulletsIndex = bullets.length;
    while (bulletsIndex--) {
      bullets[bulletsIndex].update();
    }
    for (const experience of experiences) {
      experience.update();
    }
    for (const animation of spriteAnimations) {
      animation.update();
    }
    gameTimer = millis() - timeGameStart;
  }
  ui.update();
}
