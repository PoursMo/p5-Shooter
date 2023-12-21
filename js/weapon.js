class Weapon {
  constructor(positionOffsets, startWeaponCount = 1, baseFireDelay, weaponOwner) {
    this.positionOffsets = positionOffsets;
    this.weaponCount = startWeaponCount;
    this.baseFireDelay = baseFireDelay;
    this.fireDelay = baseFireDelay;
    this.weaponOwner = weaponOwner;
    this.type = weaponOwner.constructor.name === "PlayerShip" ? "player" : "enemy";
  }

  startFiring() {
    this.fire();
    this.fireTimeout = () => {
      this.firingTimeout = setTimeout(() => {
        this.fire();
        this.fireTimeout();
      }, this.fireDelay * 1000);
    };
    this.fireTimeout();
  }

  stopFiring() {
    clearTimeout(this.firingTimeout);
  }
}

class BulletBlasters extends Weapon {
  constructor(
    positionOffsets,
    startWeaponCount,
    baseFireDelay,
    baseDamage,
    projectileSize,
    projectileSpeed,
    weaponOwner,
    fireDirection
  ) {
    super(positionOffsets, startWeaponCount, baseFireDelay, weaponOwner);
    this.baseDamage = baseDamage;
    this.damage = baseDamage;
    this.projectileSize = projectileSize;
    this.projectileSpeed = projectileSpeed;
    if (fireDirection === "up") this.fireDirection = createVector(0, -1);
    else if (fireDirection === "down") this.fireDirection = createVector(0, 1);
    else this.target = fireDirection;
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      const WeaponPosition = p5.Vector.add(this.weaponOwner.position, this.positionOffsets[index]);
      if (this.target) {
        this.fireDirection = p5.Vector.sub(this.target.position, WeaponPosition);
        this.fireDirection.normalize();
      }
      new Bullet(WeaponPosition, this);
    }
  }
}

class PlayerBladeBlasters extends Weapon {
  level = 1;
  levelEffects = [
    //2
    () => (this.baseFireDelay -= 0.05),
    //3
    () => (this.baseDamage += 1),
    //4
    () => (this.projectileSpeed += 1),
    //5
    () => (this.baseFireDelay -= 0.05),
    //6
    () => (this.baseDamage += 1),
    //7
    () => (this.projectileSpeed += 1),
    //8
    () => (this.baseDamage += 1),
  ];

  constructor(
    positionOffsets,
    startWeaponCount,
    baseFireDelay,
    baseDamage,
    projectileSpeed,
    fireDirection
  ) {
    super(positionOffsets, startWeaponCount, baseFireDelay, player);
    this.baseDamage = baseDamage;
    this.damage = baseDamage;
    this.projectileSpeed = projectileSpeed;
    if (fireDirection === "up") this.fireDirection = createVector(0, -1);
    else if (fireDirection === "down") this.fireDirection = createVector(0, 1);
    else this.target = fireDirection;
    this.startFiring();
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      const WeaponPosition = p5.Vector.add(this.weaponOwner.position, this.positionOffsets[index]);
      if (this.target) {
        this.fireDirection = p5.Vector.sub(this.target.position, WeaponPosition);
        this.fireDirection.normalize();
      }
      new Blade(WeaponPosition, this);
    }
    bladeBlaserSound.play();
  }

  updateStats() {
    this.fireDelay = this.baseFireDelay / playerStats.fireDelayMultiplier;
    this.damage = this.baseDamage * playerStats.damageMultiplier;
    ui.bladeBlastersStats();
  }

  levelUp() {
    if (this.level < this.levelEffects.length + 1) {
      this.level++;
      this.levelEffects[this.level - 2]();
      this.updateStats();
      return true;
    } else return false;
  }
}

class BossBulletBlasters extends BulletBlasters {
  startFiring() {
    this.fireDelay = this.baseFireDelay;
    this.x = 0;
    super.startFiring();
  }

  fire() {
    super.fire();
    if (this.fireDelay > 0.4) {
      this.fireDelay = exp(-this.x);
      this.x += 0.5;
    }
  }
}

class EnemySeekerThrowers extends Weapon {
  constructor(
    positionOffsets,
    startWeaponCount,
    baseFireDelay,
    baseDamage,
    projectileSize,
    weaponOwner
  ) {
    super(positionOffsets, startWeaponCount, baseFireDelay, weaponOwner);
    this.baseDamage = baseDamage;
    this.damage = baseDamage;
    this.projectileSize = projectileSize;
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      enemyShips.push(
        new SeekerMissile(this.weaponOwner.position.copy().add(this.positionOffsets[index]), this)
      );
    }
  }
}

class PlayerSeekerThrowers extends Weapon {
  level = 1;
  levelEffects = new Array(
    //2
    () => (this.baseDamage += 1),
    //3
    () => (this.baseFireDelay -= 0.5),
    //4
    () => (this.projectileSize += 1),
    //5
    () => (this.baseDamage += 1),
    //6
    () => (this.baseDamage += 1),
    //7
    () => (this.projectileSize += 1),
    //8
    () => (this.baseFireDelay -= 0.5)
  );

  constructor(positionOffsets, startWeaponCount, baseFireDelay, baseDamage, projectileSize) {
    super(positionOffsets, startWeaponCount, baseFireDelay, player);
    this.baseDamage = baseDamage;
    this.damage = baseDamage;
    this.projectileSize = projectileSize;
    this.startFiring();
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new PlayerSeekerBullet(
        this.weaponOwner.position.copy().add(this.positionOffsets[index]),
        this
      );
    }
    seekerThrowerSound.play();
  }

  updateStats() {
    this.fireDelay = this.baseFireDelay / playerStats.fireDelayMultiplier;
    this.damage = this.baseDamage * playerStats.damageMultiplier;
    ui.seekerThrowersStats();
  }

  levelUp() {
    if (this.level < this.levelEffects.length + 1) {
      this.level++;
      this.levelEffects[this.level - 2]();
      this.updateStats();
      return true;
    } else return false;
  }
}

class LaserGuns extends Weapon {
  constructor(
    positionOffsets,
    startWeaponCount,
    baseFireDelay,
    baseDamagePerSeconds,
    tickRate,
    laserWidth,
    laserDuration,
    weaponOwner,
    fireDirection
  ) {
    super(positionOffsets, startWeaponCount, baseFireDelay + laserDuration, weaponOwner);
    this.fireDelay = baseFireDelay + laserDuration;
    this.baseDamagePerSecond = baseDamagePerSeconds;
    this.damagePerSeconds = baseDamagePerSeconds;
    this.laserWidth = laserWidth;
    this.laserDuration = laserDuration;
    this.tickRate = tickRate;
    if (fireDirection === "up") this.fireDirection = createVector(0, -1);
    else if (fireDirection === "down") this.fireDirection = createVector(0, 1);
  }

  fire() {
    for (let index = 0; index < this.weaponCount; index++) {
      new Laser(this.positionOffsets[index], this);
    }
  }
}

class PlayerLaserGuns extends LaserGuns {
  level = 1;
  levelEffects = new Array(
    //2
    () => (this.baseDamagePerSecond += 1),
    //3
    () => (this.laserWidth += 5),
    //4
    () => (this.baseDamagePerSecond += 1),
    //5
    () => (this.laserDuration += 1),
    //6
    () => (this.laserWidth += 5),
    //7
    () => (this.baseDamagePerSecond += 1),
    //8
    () => (this.baseFireDelay -= 0.5)
  );

  constructor(
    positionOffsets,
    startWeaponCount,
    baseFireDelay,
    baseDamagePerSeconds,
    tickRate,
    laserWidth,
    laserDuration
  ) {
    super(
      positionOffsets,
      startWeaponCount,
      baseFireDelay,
      baseDamagePerSeconds,
      tickRate,
      laserWidth,
      laserDuration,
      player,
      "up"
    );
    this.startFiring();
  }

  fire() {
    super.fire();
    laserGunSound.play();
  }

  updateStats() {
    this.fireDelay = this.baseFireDelay / playerStats.fireDelayMultiplier + this.laserDuration;
    this.damagePerSeconds = this.baseDamagePerSecond * playerStats.damageMultiplier;
    ui.laserGunsStats();
  }

  levelUp() {
    if (this.level < this.levelEffects.length + 1) {
      this.level++;
      this.levelEffects[this.level - 2]();
      this.updateStats();
      return true;
    } else return false;
  }
}
