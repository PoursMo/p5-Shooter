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

let showHitbox = false;

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
    i = bullets.length;
    while (i--) {
      bullets[i].update();
    }
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
    for (const experience of experiences) {
      experience.update();
    }
    for (const pickUp of pickUps) {
      pickUp.update();
    }
    UI.update();
  } else player.show();
}

function checkCollisionCircleRect(circle, rectangle) {
  // Find the closest point in the rectangle to the circle
  let closestX = constrain(circle.pos.x, rectangle.pos.x, rectangle.pos.x + rectangle.width);
  let closestY = constrain(circle.pos.y, rectangle.pos.y, rectangle.pos.y + rectangle.height);

  // Calculate the distance between the circle's center and the closest point in the rectangle
  let distance = dist(circle.pos.x, circle.pos.y, closestX, closestY);

  // Check if the distance is less than the circle's radius
  return distance < circle.size / 2;
}

function checkCollisionRectRect(rec1, rec2) {
  if (rec1.height < 0) {
    if (
      rec1.pos.x + rec1.width < rec2.pos.x ||
      rec1.pos.x > rec2.pos.x + rec2.width ||
      rec1.pos.y < rec2.pos.y ||
      height + rec1.height - rec1.pos.y > rec2.pos.y + rec2.height
    ) {
      return false; // No collision
    } else {
      return true; // Collision
    }
  } else if (rec2.height < 0) {
    if (
      rec1.pos.x + rec1.width < rec2.pos.x ||
      rec1.pos.x > rec2.pos.x + rec2.width ||
      rec1.pos.y + rec1.height < height + rec2.height - rec2.pos.y ||
      rec1.pos.y > rec2.pos.y
    ) {
      return false; // No collision
    } else {
      return true; // Collision
    }
  } else if (
    rec1.pos.x + rec1.width < rec2.pos.x ||
    rec1.pos.x > rec2.pos.x + rec2.width ||
    rec1.pos.y + rec1.height < rec2.pos.y ||
    rec1.pos.y > rec2.pos.y + rec2.height
  ) {
    return false; // No collision
  } else {
    return true; // Collision
  }
}

function checkCollisionCircleCircle(circle1, circle2) {
  // Calculate the distance between the centers of the circles
  let distance = dist(circle1.pos.x, circle1.pos.y, circle2.pos.x, circle2.pos.y);

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
    this.pos = createVector(random(width), random(-height, height));
  }

  initialize() {
    this.pos = createVector(random(width), random(0, -height));
    this.size = round(random(2, 5));
    this.alpha = random(100, 200);
    this.speed = map(this.size, 2, 5, 2, 4);
  }
  update() {
    this.pos.y += this.speed;
    if (this.pos.y > 600 + this.size) {
      this.initialize();
    }
    this.show();
  }
  show() {
    push();
    fill(255, this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
    pop();
  }
}
