class PlayerShip {
  direction = createVector();
  bladeBlasters;
  seekerThrowers;
  laserGuns;
  baseSpeed = 5;
  speed = this.baseSpeed;
  invulTime = 0.3;
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
    this.damageable.update();
    this.show();
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
    this.damageable.invulnerable = true;
    setTimeout(() => (this.damageable.invulnerable = false), this.invulTime * 1000);
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

  bladeBlasterStats = {
    positionOffsets: [createVector(16, -10), createVector(-16, -10)],
    startWeaponCount: 2,
    baseFireDelay: 0.5,
    baseDamage: 1,
    projectileSpeed: 8,
  };

  seekerThrowersStats = {
    positionOffsets: [
      createVector(playerSprite.width / 2, -10),
      createVector(-playerSprite.width / 2, -10),
    ],
    startWeaponCount: 2,
    baseFireDelay: 4,
    baseDamage: 5,
    projectileSize: 8,
  };

  laserGunsStats = {
    positionOffsets: [createVector(16, -10), createVector(-16, -10)],
    startWeaponCount: 2,
    baseFireDelay: 5,
    baseDamagePerSeconds: 5,
    laserWidth: 15,
    laserDuration: 3,
    tickRate: 0.2,
  };

  gainExperience(amount) {
    this.experience += amount;
    if (this.experience >= 10) {
      this.levelUp();
      this.experience -= 10;
    }
  }

  levelUp() {
    //level up animation
    spriteAnimations.push(new SpriteAnimation(levelUpAnimationSprites, player.position));
    //levels
    this.level++;
    if (this.level === 1) {
      player.engines = new PlayerEngines();
      player.bladeBlasters = new PlayerBladeBlasters(
        this.bladeBlasterStats.positionOffsets,
        this.bladeBlasterStats.startWeaponCount,
        this.bladeBlasterStats.baseFireDelay,
        this.bladeBlasterStats.baseDamage,
        this.bladeBlasterStats.projectileSpeed,
        "up"
      );
    } else if (this.level === 5)
      player.seekerThrowers = new PlayerSeekerThrowers(
        this.seekerThrowersStats.positionOffsets,
        this.seekerThrowersStats.startWeaponCount,
        this.seekerThrowersStats.baseFireDelay,
        this.seekerThrowersStats.baseDamage,
        this.seekerThrowersStats.projectileSize
      );
    else if (this.level === 10)
      player.laserGuns = new PlayerLaserGuns(
        this.laserGunsStats.positionOffsets,
        this.laserGunsStats.startWeaponCount,
        this.laserGunsStats.baseFireDelay,
        this.laserGunsStats.baseDamagePerSeconds,
        this.laserGunsStats.tickRate,
        this.laserGunsStats.laserWidth,
        this.laserGunsStats.laserDuration
      );
    else if (player.bladeBlasters.levelUp()) return;
    else if (player.seekerThrowers.levelUp()) return;
    else if (player.laserGuns.levelUp()) return;
    else {
      this.damageMultiplier += 0.01;
      this.fireDelayMultiplier += 0.01;
      player.bladeBlasters.updateStats();
      player.seekerThrowers.updateStats();
      player.laserGuns.updateStats();
    }
  }
}
