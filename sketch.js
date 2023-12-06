let bullets = new Array();
let lasers = new Array();
let enemyShips = new Array();
let waves = new Array();
let experiences = new Array();
let weapons = new Array();

let player;
let isGameOver = true;
let timeGameStart;
let wavesManager;

let shipsSpriteDown;
let shipsSpriteUp;
let playerSprite;
let enemySprites = new Array();
let bossSprite;
let playButton;

let showHitbox = true;

function preload() {
  shipsSpriteDown = loadImage("./assets/ships_looking_down.png");
  shipsSpriteUp = loadImage("./assets/ships_looking_up.png");
}

function setup() {
  playerSprite = shipsSpriteUp.get(63, 71, 129, 101);
  enemySprites.push(shipsSpriteDown.get(335, 1611, 97, 137));
  enemySprites.push(shipsSpriteDown.get(335, 1859, 97, 137));
  bossSprite = shipsSpriteDown.get(283, 2359, 201, 165);
  createCanvas(400, 600);
  textAlign(CENTER, CENTER);
  ShowPlayButton();
}

function ShowPlayButton() {
  if (playButton === undefined) {
    playButton = createButton("Play");
    playButton.style("font-size", "35px");
    playButton.class("p5Canvas");
    playButton.size(150, 70);
    playButton.center();
    playButton.mouseClicked(newGame);
  } else {
    playButton.show();
  }
}

function gameOver() {
  isGameOver = true;
  ShowPlayButton();
}

function newGame() {
  playButton.hide();
  isGameOver = false;
  timeGameStart = millis();
  bullets = new Array();
  lasers = new Array();
  enemyBullets = new Array();
  enemyShips = new Array();
  waves = new Array();
  experiences = new Array();
  weapons = new Array();
  player = new PlayerShip(playerSprite);
  weapons.push(new BulletBlaster(0.5, 5, 7));
  for (let index = 0; index < enemyShips.length; index++) {
    const ship = enemyShips[index];
    ship.direction.x = (index + 1) / 10;
  }
  wavesManager = new WaveManager();
}

let i;

function draw() {
  background(40);
  if (!isGameOver) {
    wavesManager.update();
    i = bullets.length;
    while (i--) {
      bullets[i].update();
    }
    for (const laser of lasers) {
      laser.update();
    }
    player.update();
    for (const weapon of weapons) {
      weapon.update();
    }
    for (const ship of enemyShips) {
      ship.update();
    }
    for (const experience of experiences) {
      experience.update();
    }
  }
  // circle(50, 50, 100);
}

function checkCollisionCircleRect(circ, rectangle) {
  // Find the closest point in the rectangle to the circle
  let closestX = constrain(
    circ.pos.x,
    rectangle.pos.x,
    rectangle.pos.x + rectangle.width
  );
  let closestY = constrain(
    circ.pos.y,
    rectangle.pos.y,
    rectangle.pos.y + rectangle.height
  );

  // Calculate the distance between the circle's center and the closest point in the rectangle
  let distance = dist(circ.pos.x, circ.pos.y, closestX, closestY);

  // Check if the distance is less than the circle's radius
  return distance < circ.size / 2;
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
