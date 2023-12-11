class Weapon {
  #fireCooldown = true;
  shootTimer = 0;

  constructor(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner) {
    this.posOffset = positionOffset;
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
    if (millis() - this.shootTimer >= this.fireDelay * 1000) {
      this.#fireCooldown = false;
    }
    if (!this.#fireCooldown) {
      this.fire();
      this.#fireCooldown = true;
      this.shootTimer = millis();
    }
  }

  fire() {}

  destroy() {
    weapons.splice(weapons.indexOf(this), 1);
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
        this.dir = createVector(0, -1);
        break;
      case "down":
        this.dir = createVector(0, 1);
        break;
      case "atPlayer":
        this.dir = player.pos.copy();
        break;
      default:
        print("no dir");
        break;
    }
  }

  fire() {
    new Bullet(this.weaponOwner.pos.copy().add(this.posOffset), this);
  }
}

class SeekerThrower extends Weapon {
  constructor(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner) {
    super(positionOffset, baseFireDelay, baseDamage, projectileSize, weaponOwner);
  }

  fire() {
    new SeekerBullet(this.weaponOwner.pos.copy().add(this.posOffset), this);
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
        this.dir = createVector(0, -1);
        break;
      case "down":
        this.dir = createVector(0, 1);
        break;
      case "atPlayer":
        this.dir = player.pos.copy().sub(this.posOffset);
        break;
      default:
        break;
    }
    this.laserDuration = laserDuration;
    this.tickRate = tickRate;
  }

  fire() {
    lasers.push(
      new Laser(this.spawnOffsets[index], this.type, this.projectileSize, this.laserDuration, this)
    );
  }
}
