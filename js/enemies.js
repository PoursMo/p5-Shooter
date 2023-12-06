class EnemyShip extends Ship {
  #fireCooldown = false;
  #shootTimer = 0;
  bulletSize = 7;
  bulletSpeed = 4;
  speed = 2;

  //enemyTypes :
  //0 = shoots straight
  //1 = shoots at player

  constructor(pos, direction, enemyType) {
    super(enemySprites[enemyType], pos, direction);
    this.fireDelay = random(0.9, 1.5);
    this.enemyType = enemyType;
  }

  update() {
    super.update();
    this.checkBounds();
    this.handleShoot();
    if (checkCollisionRectRect(this.hitbox, player.hitbox)) {
      this.destroy();
      player.getHit();
      experiences.push(new Experience(this.pos));
    }
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
    let shootDir = createVector();
    if (this.enemyType === 0) {
      shootDir.y = 1;
    } else if (this.enemyType === 1) {
      shootDir = player.pos.copy().sub(this.pos);
    }
    new Bullet(
      createVector(this.pos.x + 0.5 * this.sprite.width, this.pos.y + this.sprite.height),
      shootDir,
      "enemy",
      this.bulletSpeed,
      this.bulletSize
    );
  }

  checkBounds() {
    if (
      this.pos.x > width + 100 ||
      this.pos.x < -100 ||
      this.pos.y > height + 100 ||
      this.pos.y < -100
    ) {
      this.destroy();
    }
  }

  destroy() {
    enemyShips.splice(enemyShips.indexOf(this), 1);
  }
}

class Boss extends Ship {
  constructor(position) {
    super(bossSprite, position, createVector(), 100);
  }
}
