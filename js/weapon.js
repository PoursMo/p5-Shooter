class Weapon {
  #fireCooldown = false;
  #shootTimer = 0;
  projectileCount = 2;
  level = 1;

  constructor(fireDelay, projectileSize) {
    this.fireDelay = fireDelay;
    this.projectileSize = projectileSize;
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

class BulletBlaster extends Weapon {
  constructor(fireDelay, projectileSize, bulletSpeed) {
    super(fireDelay, projectileSize);
    this.bulletSpeed = bulletSpeed;
    this.weaponSpawnOffset = new Array(
      createVector(player.sprite.width * 0.2, 5),
      createVector(player.sprite.width * 0.8, 5),
      createVector(player.sprite.width * 0.95, 5),
      createVector(player.sprite.width * 0.05, 5),
      createVector(player.sprite.width * 1.1, 5),
      createVector(player.sprite.width * -0.1, 5)
    );
  }

  fire() {
    for (let index = 0; index < this.projectileCount; index++) {
      new Bullet(
        player.pos.copy().add(this.weaponSpawnOffset[index]),
        createVector(0, -1),
        "player",
        this.bulletSpeed,
        this.projectileSize
      );
    }
  }

  levelUp() {
    super.levelUp();
    if (this.projectileCount < this.weaponSpawnOffset.length) {
      this.projectileCount += 2;
    } else {
      this.fireDelay /= 1 + 0.2;
    }
  }
}

class SeekerThrower extends Weapon {
  constructor(fireDelay, projectileSize) {
    super(fireDelay, projectileSize);
    this.weaponSpawnOffset = new Array(
      createVector(0, player.sprite.height * 0.5),
      createVector(player.sprite.width, player.sprite.height * 0.5),
      createVector(0, player.sprite.height * 0.9),
      createVector(player.sprite.width, player.sprite.height * 0.9)
    );
  }

  fire() {
    for (let index = 0; index < this.projectileCount; index++) {
      new SeekerBullet(
        player.pos.copy().add(this.weaponSpawnOffset[index]),
        "player",
        this.projectileSize
      );
    }
  }

  levelUp() {
    super.levelUp();
    if (this.projectileCount < this.weaponSpawnOffset.length) {
      this.projectileCount += 2;
    } else {
      this.fireDelay /= 1 + 0.1;
    }
  }
}

class LaserGun extends Weapon {
  constructor(fireDelay, projectileSize, laserDuration) {
    super(fireDelay + laserDuration, projectileSize);
    this.laserDuration = laserDuration;
    this.weaponSpawnOffset = new Array(
      createVector(player.sprite.width * 0.2 - projectileSize, 5),
      createVector(player.sprite.width * 0.8, 5)
    );
  }

  fire() {
    for (let index = 0; index < this.projectileCount; index++) {
      lasers.push(
        new Laser(this.weaponSpawnOffset[index], "player", this.projectileSize, this.laserDuration)
      );
    }
  }

  levelUp() {
    super.levelUp();
    if (this.fireDelay > this.laserDuration) {
      this.fireDelay = (this.fireDelay - this.laserDuration) / (1 + 0.1) + this.laserDuration;
    }
  }
}
