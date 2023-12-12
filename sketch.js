let bullets = new Array();
let lasers = new Array();
let enemyShips = new Array();
let waves = new Array();
let experiences = new Array();
let weapons = new Array();
let pickUps = new Array();
let stars = new Array();
bossKilled = false;

let player;
let playerStats;
let isGameOver = true;
let timeGameStart;
let wavesManager;

let shipsSpriteDown;
let shipsSpriteUp;
let playerSprite;
let pathfinderSprite;
let ravenSprite;
let hawkSprite;
let bossSprite;
let playButton;
let pixelFont;

let showHitbox = true;

function preload() {
  shipsSpriteDown = loadImage("./assets/ships_looking_down.png");
  shipsSpriteUp = loadImage("./assets/ships_looking_up.png");
  pixelFont = loadFont("./assets/retro_gaming.ttf");
}

function setup() {
  frameRate(60);
  playerSprite = shipsSpriteUp.get(63, 71, 129, 101);
  hawkSprite = shipsSpriteDown.get(335, 1611, 97, 137);
  ravenSprite = shipsSpriteDown.get(335, 1859, 97, 137);
  pathfinderSprite = shipsSpriteDown.get(335, 855, 97, 85);
  bossSprite = shipsSpriteDown.get(283, 2359, 201, 165);
  createCanvas(400, 600);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  imageMode(CENTER);
  UI.showPlayButton();
  player = new PlayerShip(playerSprite);
  for (let index = 0; index < 50; index++) {
    stars.push(new Star());
  }
}

function gameOver() {
  isGameOver = true;
  UI.showPlayButton();
}

function newGame() {
  playButton.hide();
  isGameOver = false;
  bossKilled = false;
  timeGameStart = millis();
  bullets = new Array();
  lasers = new Array();
  enemyShips = new Array();
  waves = new Array();
  experiences = new Array();
  weapons = new Array();
  pickUps = new Array();
  UI.initialize();
  player = new PlayerShip(playerSprite);
  playerStats = new PlayerStats();
  playerStats.levelUp();
  wavesManager = new WaveManager();
}

let i;

function draw() {
  background(0);
  for (const star of stars) {
    star.update();
  }
  if (!isGameOver) {
    wavesManager.update();
    player.update();
    i = enemyShips.length;
    while (i--) {
      enemyShips[i].update();
    }
    for (const weapon of weapons) {
      weapon.update();
    }
    for (const laser of lasers) {
      laser.update();
    }
    i = bullets.length;
    while (i--) {
      bullets[i].update();
    }
    for (const experience of experiences) {
      experience.update();
    }
    for (const pickUp of pickUps) {
      pickUp.update();
    }
    UI.update();
  } else player.show();
}

function checkCollisionCircleRect(circle, rect) {
  // Calculate half-width and half-height for the rectangle
  let w = rect.width / 2;
  let h = rect.height / 2;

  // Find the closest point on the rectangle to the circle
  let closestX = constrain(circle.position.x, rect.position.x - w, rect.position.x + w);
  let closestY = constrain(circle.position.y, rect.position.y - h, rect.position.y + h);

  // Calculate the distance between the circle and the closest point on the rectangle
  let distance = dist(circle.position.x, circle.position.y, closestX, closestY);

  // Check for collision
  if (distance <= circle.size / 2) {
    return true; // Collision detected
  }
  return false; // No collision
}

function checkCollisionRectRect(rect1, rect2) {
  // Calculate half-width and half-height for each rectangle
  let w1 = abs(rect1.width / 2);
  let h1 = abs(rect1.height / 2);
  let w2 = abs(rect2.width / 2);
  let h2 = abs(rect2.height / 2);

  // Calculate the distance between the centers of the rectangles
  let dx = abs(rect1.position.x - rect2.position.x);
  let dy = abs(rect1.position.y - rect2.position.y);

  // Check for overlap
  if (dx <= w1 + w2 && dy <= h1 + h2) {
    return true; // Collision detected
  }

  return false; // No collision
}

function checkCollisionCircleCircle(circle1, circle2) {
  // Calculate the distance between the centers of the circles
  let distance = dist(
    circle1.position.x,
    circle1.position.y,
    circle2.position.x,
    circle2.position.y
  );

  // Check if the distance is less than the sum of their radii
  if (distance < circle1.size / 2 + circle2.size / 2) {
    return true; // Colliding
  } else {
    return false; // Not colliding
  }
}

class Star {
  constructor() {
    this.initialize();
    this.position = createVector(random(width), random(-height, height));
  }

  initialize() {
    this.position = createVector(random(width), random(0, -height));
    this.size = round(random(2, 5));
    this.alpha = random(100, 200);
    this.speed = map(this.size, 2, 5, 1, 3);
  }
  update() {
    this.position.y += this.speed;
    if (this.position.y > 600 + this.size) {
      this.initialize();
    }
    this.show();
  }
  show() {
    push();
    fill(255, this.alpha);
    circle(this.position.x, this.position.y, this.size);
    pop();
  }
}
