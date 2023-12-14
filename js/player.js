class PlayerShip extends Ship {
  direction = createVector();
  bulletBlaster;
  seekerThrower;
  laserGun;
  engines;
  baseSpeed = 5;
  speed = this.baseSpeed;
  #lastHitTime = 0;
  invulTime = 0.3;
  damageable = new Damageable("enemy", "rectangle", playerStats.maxHealth, this);

  constructor(sprite) {
    super(sprite, 0, 0);
    this.health = this.maxHealth;
    this.position = createVector(width / 2, height - 60);
    this.hitbox = new Hitbox("rectangle", this, createVector(0, 6), -8, -15);
  }

  update() {
    this.handleControls();
    this.direction.normalize();
    this.position.add(this.direction.mult(this.speed));
    this.#boundsCollision();
    this.hitbox.update();
    if (this.damageable.invulnerable && millis() - this.#lastHitTime >= this.invulTime * 1000) {
      this.damageable.invulnerable = false;
    }
    this.damageable.update();
    this.show();
    if (this.bulletBlaster) {
      this.bulletBlaster.update();
    }
    if (this.seekerThrower) {
      this.seekerThrower.update();
    }
    if (this.laserGun) {
      this.laserGun.update();
    }
    if (this.engines) {
      this.engines.update();
    }
  }

  #boundsCollision() {
    // Calculate half-width and half-height for the rectangle
    let w = this.sprite.width / 2;
    let h = this.sprite.height / 2;

    // Constrain the rectangle's position to stay within the canvas
    this.position.x = constrain(this.position.x, w, width - w);
    this.position.y = constrain(this.position.y, h, height - h);
  }

  onTakeDamage() {
    spriteAnimations.push(new SpriteAnimation(bubbleExplosionSprites, this.position));
    this.#lastHitTime = millis();
    this.damageable.invulnerable = true;
  }

  onDeath() {
    gameOver();
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
    //Right Shift
    if (keyIsDown(16)) {
      if (devMode) {
        playerStats.levelUp();
      }
    }
    //Esc
    if (keyIsDown(27)) {
      gameOver();
    }
  }
}

class PlayerStats {
  maxHealth = 5;
  experience = 0;
  level = 0;
  damageMultiplier = 1;
  fireDelayMultiplier = 1;

  gainExperience() {
    this.experience++;
    if (this.experience % 10 === 0) {
      this.levelUp();
      this.experience = 0;
    }
  }

  levelUp() {
    this.level++;
    this.damageMultiplier += 0.01;
    this.fireDelayMultiplier += 0.01;
    switch (this.level) {
      case 1:
        player.bulletBlaster = new PlayerBulletBlasters();
        break;
      case 3:
        player.bulletBlaster.weaponCount += 2;
        break;
      case 5:
        player.bulletBlaster.weaponCount += 2;
        break;
      case 7:
        player.seekerThrower = new PlayerSeekerThrowers();
        break;
      case 9:
        player.seekerThrower.weaponCount += 2;
        break;
      case 11:
        player.laserGun = new PlayerLaserGuns();
        break;
      case 13:
        player.engines = new PlayerEngines();
    }
    ui.updateStats();
  }
}
