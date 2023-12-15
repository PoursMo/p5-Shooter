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
    if (weapons.indexOf(this) != -1) {
      weapons.splice(weapons.indexOf(this), 1);
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
      this.direction = player.position.copy().sub(this.weaponOwner.position);
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
    enemyShips.push(
      new SeekerMissile(this.weaponOwner.position.copy().add(this.positionOffset), this)
    );
  }
}

class LaserGun extends Weapon {
  constructor(
    positionOffset,
    baseFireDelay,
    damagePerSecond,
    tickRate,
    laserWidth,
    laserDuration,
    weaponOwner,
    direction
  ) {
    super(positionOffset, baseFireDelay + laserDuration, damagePerSecond, laserWidth, weaponOwner);
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
    new Laser(this.positionOffset, this);
  }
}

class PlayerBulletBlasters extends Weapon {
  bulletSpeed = 7;
  direction = createVector(0, -1);
  weaponCount = 2;
  level = 1;

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
    this.fireDelay = this.baseFireDelay / playerStats.fireDelayMultiplier;
    this.damage = this.baseDamage * playerStats.damageMultiplier;
    super.update();
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new Bullet(player.position.copy().add(this.positionOffsets[index]), this);
    }
  }

  levelEffects = new Array(
    //2
    () => (this.baseDamage += 1),
    //3
    () => (this.weaponCount += 2),
    //4
    () => (this.baseFireDelay -= 0.05),
    //5
    () => (this.projectileSize += 1),
    //6
    () => (this.bulletSpeed += 1),
    //7
    () => (this.weaponCount += 2),
    //8
    () => (this.baseFireDelay -= 0.05)
  );

  levelUp() {
    if (this.level < this.levelEffects.length + 1) {
      this.level++;
      this.levelEffects[this.level - 2]();
      return true;
    } else return false;
  }
}

class PlayerSeekerThrowers extends Weapon {
  bulletSpeed = 7;
  weaponCount = 2;
  level = 1;

  constructor() {
    super(undefined, 4, 5, 7, player);
    this.positionOffsets = new Array(
      createVector(player.sprite.width / 2, -10),
      createVector(-player.sprite.width / 2, -10),
      createVector(player.sprite.width / 2, 10),
      createVector(-player.sprite.width / 2, 10)
    );
  }

  update() {
    this.fireDelay = this.baseFireDelay / playerStats.fireDelayMultiplier;
    this.damage = this.baseDamage * playerStats.damageMultiplier;
    super.update();
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new PlayerSeekerBullet(player.position.copy().add(this.positionOffsets[index]), this);
    }
  }

  levelEffects = new Array(
    //2
    () => (this.baseDamage += 1),
    //3
    () => (this.baseFireDelay -= 0.5),
    //4
    () => (this.projectileSize += 1),
    //5
    () => (this.weaponCount += 2),
    //6
    () => (this.baseDamage += 1),
    //7
    () => (this.projectileSize += 1),
    //8
    () => (this.baseFireDelay -= 0.5)
  );

  levelUp() {
    if (this.level < this.levelEffects.length + 1) {
      this.level++;
      this.levelEffects[this.level - 2]();
      return true;
    } else return false;
  }
}

class PlayerLaserGuns extends Weapon {
  laserDuration = 3;
  tickRate = 0.2;
  weaponCount = 2;
  direction = createVector(0, -1);
  level = 1;

  constructor() {
    super(undefined, 5, 5, 15, player);
    this.fireDelay = this.baseFireDelay + this.laserDuration;
    this.positionOffsets = new Array(createVector(16, -10), createVector(-16, -10));
  }

  update() {
    this.fireDelay = this.baseFireDelay / playerStats.fireDelayMultiplier + this.laserDuration;
    this.damage = this.baseDamage * playerStats.damageMultiplier;
    super.update();
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new Laser(this.positionOffsets[index], this);
    }
  }

  levelEffects = new Array(
    //2
    () => (this.baseDamage += 1),
    //3
    () => (this.projectileSize += 5),
    //4
    () => (this.baseDamage += 1),
    //5
    () => (this.laserDuration += 1),
    //6
    () => (this.projectileSize += 5),
    //7
    () => (this.baseDamage += 1),
    //8
    () => (this.baseFireDelay -= 0.5)
  );

  levelUp() {
    if (this.level < this.levelEffects.length + 1) {
      this.level++;
      this.levelEffects[this.level - 2]();
      return true;
    } else return false;
  }
}
