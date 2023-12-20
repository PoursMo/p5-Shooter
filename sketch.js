let bullets = new Array();
let lasers = new Array();
let blades = new Array();
let enemyShips = new Array();
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
let spawnManager;
let ui;

//Sprite Sheets
let shipsSpriteDown;
let shipsSpriteUp;
let asteroid1AnimationSheet;
let asteroid2AnimationSheet;
let levelUpAnimationSheet;
let bubbleExplosionAnimationSheet;

//Sprites & animations
let bladeSprite;
let levelUpAnimationSprites;
let asteroid1Sprites;
let asteroid2Sprites;
let playerSprite;
let playerEnginesSprite;
let pathfinderSprite;
let ravenSprite;
let hawkSprite;
let bomberSprite;
let zapperSprite;
let bossSprite;
let bubbleExplosionAnimationSprites;
let bubbleExplosionAnimationSpritesSmall;
let bombPickUpSprite;
let healthPickUpSprite;
let warningSprite;
let pixelFont;

let devMode = false;

function preload() {
  bladeSprite = loadImage("./assets/blade.png");
  shipsSpriteDown = loadImage("./assets/ships_looking_down.png");
  shipsSpriteUp = loadImage("./assets/ships_looking_up.png");
  bubbleExplosionAnimationSheet = loadImage("./assets/bubble_explosion_animation.png");
  asteroid1AnimationSheet = loadImage("./assets/animated_asteroid.png");
  asteroid2AnimationSheet = loadImage("./assets/animated_asteroid2.png");
  levelUpAnimationSheet = loadImage("./assets/level_up_animation.png");
  bombPickUpSprite = loadImage("./assets/pickup_bomb.png");
  healthPickUpSprite = loadImage("./assets/pickup_health.png");
  warningSprite = loadImage("./assets/warning.png");
  pixelFont = loadFont("./assets/retro_gaming.ttf");
}

function setup() {
  frameRate(60);

  //Sprites
  bubbleExplosionAnimationSprites = sliceSpriteSheet(bubbleExplosionAnimationSheet, 10, 1);
  for (const sprite of bubbleExplosionAnimationSprites) {
    sprite.resize(0, 60);
  }
  bubbleExplosionAnimationSpritesSmall = sliceSpriteSheet(bubbleExplosionAnimationSheet, 10, 1);
  for (const sprite of bubbleExplosionAnimationSpritesSmall) {
    sprite.resize(0, 10);
  }
  asteroid1Sprites = sliceSpriteSheet(asteroid1AnimationSheet, 16, 2);
  for (const sprite of asteroid1Sprites) {
    sprite.resize(0, 40);
  }
  asteroid2Sprites = sliceSpriteSheet(asteroid2AnimationSheet, 16, 2);
  for (const sprite of asteroid2Sprites) {
    sprite.resize(0, 40);
  }
  levelUpAnimationSprites = sliceSpriteSheet(levelUpAnimationSheet, 8, 1);
  bladeSprite.resize(25, 0);
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
  bossSprite.resize(0, 350);

  //Canvas
  createCanvas(400, 600);

  //Modes
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  imageMode(CENTER);

  //Game Setup
  spawnManager = new SpawnManager();
  ui = new UI();
  ui.showPlayButton();
  for (let index = 0; index < 50; index++) {
    stars.push(new Star());
  }
}

function gameOver() {
  isGameRunning = false;
  isGameOver = true;
  //stop all intervals and timeouts
  let id = setTimeout(function () {}, 0);
  while (id--) {
    clearTimeout(id);
    clearInterval(id);
  }
  ui.showPlayButton();
  spawnManager.clearIntervals();
}

function newGame() {
  ui.hidePlayButton();
  bullets = new Array();
  lasers = new Array();
  blades = new Array();
  enemyShips = new Array();
  experiences = new Array();
  pickUps = new Array();
  spriteAnimations = new Array();
  playerStats = new PlayerStats();
  player = new PlayerShip(playerSprite);
  playerStats.levelUp();
  spawnManager.initialize();
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
    player.update();
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
    let bladesIndex = blades.length;
    while (bladesIndex--) {
      blades[bladesIndex].update();
    }
    let enemyShipsIndex = enemyShips.length;
    while (enemyShipsIndex--) {
      enemyShips[enemyShipsIndex].update();
    }
    for (const experience of experiences) {
      experience.update();
    }
    let animationsIndex = spriteAnimations.length;
    while (animationsIndex--) {
      spriteAnimations[animationsIndex].update();
    }
    gameTimer = millis() - timeGameStart;
  }
  ui.update();
}
