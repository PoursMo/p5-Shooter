class PlayerShip extends Ship {
  #fireCooldown = false;
  #shootTimer = 0;
  #lastHitTime = 0;
  health = 3;
  speed = 5;
  fireDelay = 0.5;
  bulletSize = 5;
  bulletSpeed = 10;
  bulletCount = 6;
  invulTime = 0.2;
  experience = 0;
  level = 1;
  fireDelayGainPerLevel = 0.2;
  direction = createVector();

  constructor(sprite) {
    super(sprite, 0, 0, 35);
    this.pos = createVector(
      width / 2 - this.sprite.width / 2,
      height - this.size - 20
    );
    this.bulletSpawns = new Array(
      createVector(this.sprite.width * 0.20, 5),
      createVector(this.sprite.width * 0.80, 5),
      createVector(this.sprite.width * 0.95, 5),
      createVector(this.sprite.width * 0.05, 5),
      createVector(this.sprite.width * 1.10, 5),
      createVector(this.sprite.width * -0.10, 5),
    );
    this.hitbox = {
      pos: createVector(this.pos.x + 4, this.pos.y + 12),
      w: this.sprite.width - 8,
      h: this.sprite.height - 15,
    };
  }

  update() {
    this.handleShoot();
    this.handleControls();
    this.direction.normalize();
    this.pos.add(this.direction.mult(this.speed));
    this.boundsCollision();
    this.hitbox.pos.x = this.pos.x + 4;
    this.hitbox.pos.y = this.pos.y + 12;
    this.show();
  }

  show() {
    super.show();
    push();
    stroke(255, 0, 0);
    fill(0, 255, 0);
    stroke(0);
    rect(0, 0, (this.experience * width) / 10, 10);
    pop();
    push();
    noStroke();
    fill(200);
    textSize(15);
    text("health : " + this.health, width / 2, 20);
    text("level : " + this.level, width - 30, 20);
    this.showTime();
    pop();
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
    for (let index = 0; index < this.bulletCount; index++) {
      new Bullet(
        this.pos.copy().add(this.bulletSpawns[index]),
        createVector(0, -1),
        "player",
        this.bulletSpeed,
        this.bulletSize
      );
    }
  }

  shootSeekers() {
    new SeekerBullet(this.pos.copy().add(this.bulletSpawns[0]), "player");
    new SeekerBullet(this.pos.copy().add(this.bulletSpawns[1]), "player");
  }

  boundsCollision() {
    if (this.pos.x < 0) {
      this.pos.x = 0;
    } else if (this.pos.x + this.sprite.width > width) {
      this.pos.x = width - this.sprite.width;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
    } else if (this.pos.y + this.sprite.height > height) {
      this.pos.y = height - this.sprite.height;
    }
  }

  getHit() {
    if (millis() - this.#lastHitTime >= this.invulTime * 1000) {
      this.health--;
      background(255, 0, 0);
      this.#lastHitTime = millis();
      if (this.health <= 0) {
        gameOver();
      }
      return true;
    } else {
      return false;
    }
  }

  gainExperience() {
    this.experience++;
    if (this.experience % 10 === 0) {
      this.levelUp();
      this.experience = 0;
    }
  }

  levelUp() {
    this.level++;
    if (this.level === 2 || this.level === 4 || this.level > 5) {
      this.fireDelay /= 1 + this.fireDelayGainPerLevel;
    } else if (this.level === 3 || this.level === 5) {
      this.bulletCount += 2;
    }
  }

  handleControls() {
    //Left
    if (keyIsDown(65) || keyIsDown(37)) {
      this.direction.x = -1;
    }
    //Right
    else if (keyIsDown(68) || keyIsDown(39)) {
      this.direction.x = 1;
    } else {
      this.direction.x = 0;
    }
    //Up
    if (keyIsDown(87) || keyIsDown(38)) {
      this.direction.y = -1;
    }
    //Down
    else if (keyIsDown(83) || keyIsDown(40)) {
      this.direction.y = 1;
    } else {
      this.direction.y = 0;
    }
    //Space
    if (keyIsDown(32)) {
    }
  }

  showTime() {
    text(
      floor((millis() - timeGameStart) / 1000 / 60) +
        ":" +
        floor(((millis() - timeGameStart) / 1000) % 60),
      width / 2,
      35
    );
  }
}
