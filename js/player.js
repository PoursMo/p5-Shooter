class PlayerShip extends Ship {
  direction = createVector();
  bulletBlaster;
  seekerThrower;
  laserGun;
  baseSpeed = 5;
  speed = this.baseSpeed;

  constructor(sprite) {
    super(sprite, 0, 0, 35);
    this.health = this.maxHealth;
    this.position = createVector(width / 2, height - this.size - 20);
    this.hitbox = {
      position: createVector(),
      width: this.sprite.width - 8,
      height: this.sprite.height - 15,
    };
  }

  update() {
    this.handleControls();
    this.direction.normalize();
    this.position.add(this.direction.mult(this.speed));
    this.#boundsCollision();
    this.hitbox.position.x = this.position.x;
    this.hitbox.position.y = this.position.y + 6;
    this.show();
  }

  show() {
    super.show();
  }

  #boundsCollision() {
  // Calculate half-width and half-height for the rectangle
  let w = this.sprite.width / 2;
  let h = this.sprite.height / 2;

  // Constrain the rectangle's position to stay within the canvas
  this.position.x = constrain(this.position.x, w, width - w);
  this.position.y = constrain(this.position.y, h, height - h);
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
      playerStats.levelUp();
    }
    //Esc
    if (keyIsDown(27)) {
      gameOver();
    }
  }
}

class PlayerStats {
  maxHealth = 5;
  health = this.maxHealth;
  invulTime = 0.2;
  #lastHitTime = 0;
  experience = 0;
  level = 0;
  damageMultiplier = 1;
  fireDelayMultiplier = 1;

  gainHealth() {
    if (this.health < this.maxHealth) {
      this.health++;
    }
  }

  getHit(value) {
    if (millis() - this.#lastHitTime >= this.invulTime * 1000) {
      this.health -= value;
      background(255, 0, 0);
      this.#lastHitTime = millis();
      if (this.health <= 0) {
        gameOver();
      }
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
    this.damageMultiplier += 0.01;
    this.fireDelayMultiplier += 0.01;
    switch (this.level) {
      case 1:
        player.bulletBlaster = new PlayerBulletBlasters();
        // weapons.push(player.bulletBlaster);
        break;
      case 3:
        player.bulletBlaster.weaponCount += 2;
        break;
      case 5:
        player.bulletBlaster.weaponCount += 2;
        break;
      case 7:
        player.seekerThrower = new PlayerSeekerThrowers();
        // weapons.push(player.seekerThrower);
        break;
      case 9:
        player.seekerThrower.weaponCount += 2;
        break;
      case 11:
        player.laserGun = new PlayerLaserGuns();
        weapons.push(player.laserGun);
        break;
    }
    this.updateStats();
  }

  updateStats() {
    player.bulletBlaster.damage = player.bulletBlaster.baseDamage * this.damageMultiplier;
    player.bulletBlaster.fireDelay = player.bulletBlaster.baseFireDelay / this.fireDelayMultiplier;
    // thrower.damage = thrower.baseDamage * this.damageMultiplier;
    // thrower.fireDelay = thrower.baseFireDelay / this.fireDelayMultiplier;
    UI.test();
  }
}
