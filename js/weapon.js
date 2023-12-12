class Weapon {
  #shootTimer = 0;

  constructor(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner) {
    this.positionOffset = positionOffset;
    this.baseFireDelay = baseFireDelay;
    this.fireDelay = baseFireDelay;
    this.baseDamage = baseDamage;
    this.damage = baseDamage;
    this.projectileSize = projectileSize;
    this.weaponOwner = weaponOwner;
    this.type = weaponOwner.constructor.name === "PlayerShip" ? "player" : "enemy";
  }

  update() {
    this.handleFire();
  }

  handleFire() {
    if (millis() - this.#shootTimer >= this.fireDelay * 1000) {
      this.fire();
      this.#shootTimer = millis();
    }
  }

  fire() {}

  destroy() {
    weapons.splice(weapons.indexOf(this), 1);
  }
}

class PlayerBulletBlasters extends Weapon {
  bulletSpeed = 7;
  direction = createVector(0, -1);
  weaponCount = 2;

  constructor() {
    super(undefined, 0.5, 1, 7, player);
    this.positionOffsets = new Array(
      createVector(10 + this.projectileSize, -3 - this.projectileSize),
      createVector(-10 - this.projectileSize, -3 - this.projectileSize),
      createVector(10, -5),
      createVector(-10, -5),
      createVector(10 + this.projectileSize * 2, -5),
      createVector(-10 - this.projectileSize * 2, -5)
    );
  }

  update() {
    super.update();
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new Bullet(player.position.copy().add(this.positionOffsets[index]), this);
    }
  }
}

class PlayerSeekerThrowers extends Weapon {
  bulletSpeed = 7;
  weaponCount = 2;

  constructor() {
    super(undefined,4, 5, 7, player);
    this.positionOffsets = new Array(
      createVector(player.sprite.width / 2, -10),
      createVector(-player.sprite.width / 2, -10),
      createVector(player.sprite.width / 2, 10),
      createVector(-player.sprite.width / 2, 10)
    );
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new SeekerBullet(player.position.copy().add(this.positionOffsets[index]), this);
    }
  }
}

class PlayerLaserGuns extends Weapon {
  laserDuration = 3;
  tickRate = 0.2;
  weaponCount = 2;

  constructor() {
    super(undefined, 5, 10, 10, player);
    this.fireDelay = this.baseFireDelay + this.laserDuration;
    this.positionOffsets = new Array(createVector(16, -10), createVector(-16, -10));
  }
  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new Laser(this.positionOffsets[index], this);
    }
  }
}

class BulletBlaster extends Weapon {
  constructor(
    positionOffset,
    baseFireDelay,
    baseDamage,
    projectileSize,
    bulletSpeed,
    weaponOwner,
    direction
  ) {
    super(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner);
    this.bulletSpeed = bulletSpeed;
    switch (direction) {
      case "up":
        this.direction = createVector(0, -1);
        break;
      case "down":
        this.direction = createVector(0, 1);
        break;
      case "atPlayer":
        this.shootAtPlayer = true;
        break;
      default:
        print("no direction");
        break;
    }
  }

  update() {
    if (this.shootAtPlayer) {
      this.direction = player.position.copy().sub(this.position);
      this.direction.normalize();
    }
    super.update();
  }

  fire() {
    new Bullet(this.weaponOwner.position.copy().add(this.positionOffset), this);
  }
}

class SeekerThrower extends Weapon {
  constructor(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner) {
    super(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner);
  }

  fire() {
    new SeekerBullet(this.weaponOwner.position.copy().add(this.positionOffset), this);
  }
}

class LaserGun extends Weapon {
  constructor(
    baseFireDelay,
    damagePerSecond,
    tickRate,
    projectileSize,
    laserDuration,
    weaponOwner,
    direction
  ) {
    super(baseFireDelay + laserDuration, damagePerSecond, projectileSize, weaponOwner);
    switch (direction) {
      case "up":
        this.direction = createVector(0, -1);
        break;
      case "down":
        this.direction = createVector(0, 1);
        break;
      case "atPlayer":
        this.shootAtPlayer = true;
        break;
      default:
        break;
    }
    this.laserDuration = laserDuration;
    this.tickRate = tickRate;
  }

  update() {
    if (this.shootAtPlayer) {
      this.direction = player.position.copy().sub(this.position);
      this.direction.normalize();
    }
    super.update();
  }

  fire() {
    lasers.push(
      new Laser(this.spawnOffsets[index], this.type, this.projectileSize, this.laserDuration, this)
    );
  }
}
