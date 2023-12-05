class Weapon {
  #fireCooldown = false;
  #shootTimer = 0;
  bulletCount = 2;
  level = 1;

  constructor(fireDelay, bulletSize, bulletSpeed) {
    this.fireDelay = fireDelay;
    this.bulletSize = bulletSize;
    this.bulletSpeed = bulletSpeed;
  }

  update() {
    this.handleFire();
  }

  handleFire() {
    if (millis() - this.#shootTimer >= this.fireDelay * 1000) {
      this.#fireCooldown = false;
    }
    if (!this.#fireCooldown) {
      this.fire();
      this.#fireCooldown = true;
      this.#shootTimer = millis();
    }
  }

  fire() {}

  levelUp() {
    this.level++;
  }
}

class Blaster extends Weapon {
  constructor(fireDelay, bulletSize, bulletSpeed) {
    super(fireDelay, bulletSize, bulletSpeed);
    this.bulletSpawns = new Array();
  }

  update() {
    this.bulletSpawns[0] = createVector(player.sprite.width * 0.2, 5);
    this.bulletSpawns[1] = createVector(player.sprite.width * 0.8, 5);
    this.bulletSpawns[2] = createVector(player.sprite.width * 0.95, 5);
    this.bulletSpawns[3] = createVector(player.sprite.width * 0.05, 5);
    this.bulletSpawns[4] = createVector(player.sprite.width * 1.1, 5);
    this.bulletSpawns[5] = createVector(player.sprite.width * -0.1, 5);
    super.update();
  }

  fire() {
    for (let index = 0; index < this.bulletCount; index++) {
      new Bullet(
        player.pos.copy().add(this.bulletSpawns[index]),
        createVector(0, -1),
        "player",
        this.bulletSpeed,
        this.bulletSize
      );
    }
  }

  levelUp() {
    super.levelUp();
    if (this.level <= 3) {
      this.bulletCount += 2;
    } else {
      this.fireDelay /= 1 + 0.2;
    }
  }
}

class Seeker extends Weapon {
  fire() {
    new SeekerBullet(this.pos.copy().add(this.bulletSpawns[0]), "player");
    new SeekerBullet(this.pos.copy().add(this.bulletSpawns[1]), "player");
  }
}
