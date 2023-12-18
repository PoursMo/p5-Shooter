class PlayerShip {
  direction = createVector();
  bulletBlaster;
  seekerThrower;
  laserGun;
  baseSpeed = 5;
  speed = this.baseSpeed;
  #lastHitTime = 0;
  invulTime = 0.2;
  damageable = new Damageable("enemy", "rectangle", playerStats.maxHealth, this);
  isMoving;

  constructor() {
    this.sprite = playerSprite;
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
    if (this.isMoving) {
      this.engines.update();
      this.engines.isActive = true;
    } else this.engines.isActive = false;
  }

  show() {
    image(this.sprite, this.position.x, this.position.y);
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
    spriteAnimations.push(new SpriteAnimation(bubbleExplosionAnimationSprites, this.position));
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
      // this.engines.update();
    }
    //Down
    else if (keyIsDown(83) || keyIsDown(40)) {
      this.direction.y = 1;
    } else {
      this.direction.y = 0;
    }
    //Left Right Up
    if (
      keyIsDown(65) ||
      keyIsDown(37) ||
      keyIsDown(68) ||
      keyIsDown(39) ||
      keyIsDown(87) ||
      keyIsDown(38)
    ) {
      this.isMoving = true;
    } else this.isMoving = false;
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
    spriteAnimations.push(new SpriteAnimation(levelUpAnimationSprites, player.position));
    this.level++;
    if (this.level === 1) {
      player.engines = new PlayerEngines();
      player.bulletBlaster = new PlayerBulletBlasters();
    } else if (this.level === 5) player.seekerThrower = new PlayerSeekerThrowers();
    else if (this.level === 10) player.laserGun = new PlayerLaserGuns();
    else if (player.bulletBlaster.levelUp()) return;
    else if (player.seekerThrower.levelUp()) return;
    else if (player.laserGun.levelUp()) return;
    else {
      this.damageMultiplier += 0.01;
      this.fireDelayMultiplier += 0.01;
    }
  }
}
