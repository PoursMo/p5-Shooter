function checkCollisionCircleRect(circle, rect) {
  // Calculate half-width and half-height for the rectangle
  let w = abs(rect.width / 2);
  let h = abs(rect.height / 2);

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

class SpriteAnimation {
  #index = 0;

  constructor(sprites, arg, loop = false) {
    this.sprites = sprites;
    this.loop = loop;
    if (arg.constructor.name === "n") {
      this.position = arg.copy();
    } else {
      this.follow = true;
      this.target = arg;
    }
  }

  update() {
    if (this.follow) {
      this.position = this.target.position;
    }
    this.show();
    if (this.#index < this.sprites.length - 1) {
      if (frameCount % 5 === 0) this.#index++;
    } else if (this.loop) this.#index = 0;
    else this.destroy();
  }

  show() {
    image(this.sprites[this.#index], this.position.x, this.position.y);
  }

  destroy() {
    if (spriteAnimations.indexOf(this) != -1) {
      spriteAnimations.splice(spriteAnimations.indexOf(this), 1);
    }
  }
}

class Hitbox {
  constructor(shape, parent, positionOffset, ...sizeOffset) {
    this.shape = shape;
    this.parent = parent;
    this.positionOffset = positionOffset;
    if (shape === "rectangle") {
      this.widthOffset = sizeOffset[0];
      this.heightOffset = sizeOffset[1];
      this.width = this.parent.sprite.width + this.widthOffset;
      this.height = this.parent.sprite.height + this.heightOffset;
    } else if (shape === "circle") {
      this.sizeOffset = sizeOffset[0];
      this.size = this.parent.size + this.sizeOffset;
    }
    this.position = parent.position.copy().add(positionOffset);
  }

  update() {
    this.position = this.parent.position.copy().add(this.positionOffset);
    if (devMode) {
      this.show();
    }
  }

  show() {
    push();
    noFill();
    stroke(0, 255, 0);
    if (this.shape === "rectangle") {
      rect(this.position.x, this.position.y, this.width, this.height);
    } else if (this.shape === "circle") {
      circle(this.position.x, this.position.y, this.size);
    }
    pop();
  }
}

class Damageable {
  #laserLastHitTime = 0;
  #playerEnginesLastHitTime = 0;
  invulnerable = false;

  constructor(damagerType, parentShape, maxHealth, parent) {
    this.damagerType = damagerType;
    this.parent = parent;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    if (parentShape === "circle") {
      this.bulletFunction = checkCollisionCircleCircle;
      this.laserFunction = checkCollisionCircleRect;
    } else if (parentShape === "rectangle") {
      this.bulletFunction = checkCollisionCircleRect;
      this.laserFunction = checkCollisionRectRect;
    }
  }

  update() {
    this.checkBullets();
    this.checkLasers();
    this.checkPlayerEngines();
  }

  checkBullets() {
    let i = bullets.length;
    while (i--) {
      if (
        bullets[i].type === this.damagerType &&
        this.bulletFunction(bullets[i], this.parent.hitbox)
      ) {
        this.takeDamage(bullets[i].damage);
        bullets[i].destroy();
      }
    }
  }

  checkPlayerEngines() {
    if (
      this.damagerType === "player" &&
      player.engines.isActive &&
      millis() - this.#playerEnginesLastHitTime >= player.engines.tickRate * 1000 &&
      this.laserFunction(this.parent.hitbox, player.engines)
    ) {
      this.takeDamage(player.engines.damagePerSecond * player.engines.tickRate);
      this.#playerEnginesLastHitTime = millis();
    }
  }

  checkLasers() {
    for (const laser of lasers) {
      if (
        laser.type === this.damagerType &&
        millis() - this.#laserLastHitTime >= laser.tickRate * 1000 &&
        this.laserFunction(this.parent.hitbox, laser)
      ) {
        this.takeDamage(laser.damagePerSecond * laser.tickRate);
        this.#laserLastHitTime = millis();
      }
    }
  }

  takeDamage(value) {
    if (!this.invulnerable) {
      this.health -= value;
      this.parent.onTakeDamage();
      if (this.health <= 0) {
        this.parent.onDeath();
      }
    }
  }

  gainHealth(value) {
    if (this.health < this.maxHealth) {
      if (this.health + value > this.maxHealth) this.health = this.maxHealth;
      else this.health += value;
    }
  }
}
