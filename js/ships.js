class Ship {
  constructor(sprite, pos, direction, size = 40) {
    this.size = size;
    this.sprite = sprite;
    this.sprite.resize(0, this.size);
    this.direction = direction;
    this.pos = pos;
    this.hitbox = {
      pos: createVector(this.pos.x, this.pos.y),
      width: this.sprite.width,
      height: this.sprite.height,
    };
  }

  update() {
    this.direction.normalize();
    this.pos.add(this.direction.mult(this.speed));
    this.hitbox.pos.x = this.pos.x;
    this.hitbox.pos.y = this.pos.y;
    this.show();
  }

  isOutOfBounds() {
    return (
      this.pos.x > width + 100 ||
      this.pos.x < -100 ||
      this.pos.y > height + 100 ||
      this.pos.y < -100
    );
  }

  show() {
    if (showHitbox) {
      push();
      noFill();
      stroke(0, 255, 0);
      rect(this.hitbox.pos.x, this.hitbox.pos.y, this.hitbox.width, this.hitbox.height);
      pop();
    }
    image(this.sprite, this.pos.x, this.pos.y);
  }
}

class EnemyShip extends Ship {
  hit = false;

  update() {
    super.update();
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    if (checkCollisionRectRect(this.hitbox, player.hitbox)) {
      this.destroy();
      player.getHit(1);
      experiences.push(new Experience(this.pos));
      return;
    }
  }

  getHit(value) {
    this.hit = true;
    this.health -= value;
    if (this.health <= 0) {
      experiences.push(new Experience(this.pos));
      this.destroy();
    }
  }

  show() {
    if (this.hit) {
      this.hit = false;
      return;
    }
    super.show();
  }

  destroy() {
    enemyShips.splice(enemyShips.indexOf(this), 1);
  }
}

class Hawk extends EnemyShip {
  #fireCooldown = false;
  #shootTimer = 0;
  bulletSize = 7;
  bulletSpeed = 4;
  speed = 2;
  health = 2;

  constructor(pos, direction) {
    super(hawkSprite, pos, direction);
    this.fireDelay = random(0.9, 1.5);
    this.shootDir = createVector(0, 1);
  }

  update() {
    super.update();
    this.handleShoot();
  }

  handleShoot() {
    if (millis() - this.#shootTimer >= this.fireDelay * 1000) {
      this.#fireCooldown = false;
    }
    if (!this.#fireCooldown) {
      this.shoot();
      this.#fireCooldown = true;
      this.#shootTimer = millis();
    }
  }

  shoot() {
    new Bullet(
      createVector(this.pos.x + 0.5 * this.sprite.width, this.pos.y + this.sprite.height),
      this.shootDir,
      "enemy",
      this.bulletSpeed,
      this.bulletSize
    );
  }
}

class Pathfinder extends EnemyShip {
  speed = 2.5;
  health = 3;

  constructor(pos, direction) {
    super(pathfinderSprite, pos, direction, 30);
  }

  update() {
    super.update();
  }
}

class Raven extends EnemyShip {
  #fireCooldown = false;
  #shootTimer = 0;
  bulletSize = 7;
  bulletSpeed = 4;
  speed = 1.5;
  health = 2;

  constructor(pos, direction) {
    super(ravenSprite, pos, direction);
    this.fireDelay = random(0.9, 1.5);
  }

  update() {
    super.update();
    this.handleShoot();
  }

  handleShoot() {
    if (millis() - this.#shootTimer >= this.fireDelay * 1000) {
      this.#fireCooldown = false;
    }
    if (!this.#fireCooldown) {
      this.shoot();
      this.#fireCooldown = true;
      this.#shootTimer = millis();
    }
  }

  shoot() {
    this.shootDir = player.pos.copy().sub(this.pos);
    new Bullet(
      createVector(this.pos.x + 0.5 * this.sprite.width, this.pos.y + this.sprite.height),
      this.shootDir,
      "enemy",
      this.bulletSpeed,
      this.bulletSize
    );
  }
}

class Boss extends Ship {
  constructor(position) {
    super(bossSprite, position, createVector(), 100);
  }
}
