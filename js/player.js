class PlayerShip extends Ship {
  direction = createVector();
  bulletBlasters = new Array();
  seekerThrowers = new Array();
  laserGuns = new Array();
  baseSpeed = 4;
  speed = this.baseSpeed;

  constructor(sprite) {
    super(sprite, 0, 0, 35);
    this.health = this.maxHealth;
    this.pos = createVector(width / 2 - this.sprite.width / 2, height - this.size - 20);
    this.hitbox = {
      pos: createVector(),
      width: this.sprite.width - 8,
      height: this.sprite.height - 15,
    };
  }

  update() {
    this.handleControls();
    this.direction.normalize();
    this.pos.add(this.direction.mult(this.speed));
    this.#boundsCollision();
    this.hitbox.pos.x = this.pos.x + 4;
    this.hitbox.pos.y = this.pos.y + 12;
    this.show();
  }

  show() {
    super.show();
  }

  #boundsCollision() {
    if (this.pos.x < 0) {
      this.pos.x = 0;
    } else if (this.pos.x + this.sprite.width > width) {
      this.pos.x = width - this.sprite.width;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
    } else if (this.pos.y + this.sprite.height > height) {
      this.pos.y = height - this.sprite.height;
    }
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
      // playerStats.levelUp();
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
    this.updateStats();
    switch (this.level) {
      case 1:
        player.bulletBlasters.push(
          new BulletBlaster(createVector(player.sprite.width * 0.2, 5), 0.5, 1, 7, 7, player, "up")
        );
        weapons.push(player.bulletBlasters[player.bulletBlasters.length - 1]);
        player.bulletBlasters.push(
          new BulletBlaster(createVector(player.sprite.width * 0.8, 5), 0.5, 1, 7, 7, player, "up")
        );
        weapons.push(player.bulletBlasters[player.bulletBlasters.length - 1]);
        return;
      case 3:
        player.bulletBlasters.push(
          new BulletBlaster(createVector(player.sprite.width * 0.95, 5), 0.5, 1, 7, 7, player, "up")
        );
        weapons.push(player.bulletBlasters[player.bulletBlasters.length - 1]);
        player.bulletBlasters.push(
          new BulletBlaster(createVector(player.sprite.width * 0.05, 5), 0.5, 1, 7, 7, player, "up")
        );
        weapons.push(player.bulletBlasters[player.bulletBlasters.length - 1]);
        return;
      case 5:
        player.bulletBlasters.push(
          new BulletBlaster(createVector(player.sprite.width * 1.1, 5), 0.5, 1, 7, 7, player, "up")
        );
        weapons.push(player.bulletBlasters[player.bulletBlasters.length - 1]);
        player.bulletBlasters.push(
          new BulletBlaster(createVector(player.sprite.width * -0.1, 5), 0.5, 1, 7, 7, player, "up")
        );
        weapons.push(player.bulletBlasters[player.bulletBlasters.length - 1]);
        return;
      case 7:
        player.seekerThrowers.push(
          new SeekerThrower(createVector(0, player.sprite.height * 0.5), 3, 5, 7, player)
        );
        weapons.push(player.seekerThrowers[player.seekerThrowers.length - 1]);
        player.seekerThrowers.push(
          new SeekerThrower(
            createVector(player.sprite.width, player.sprite.height * 0.5),
            3,
            5,
            7,
            player
          )
        );
        weapons.push(player.seekerThrowers[player.seekerThrowers.length - 1]);
        return;
      case 9:
        player.seekerThrowers.push(
          new SeekerThrower(createVector(0, player.sprite.height * 0.9), 3, 5, 7, player)
        );
        weapons.push(player.seekerThrowers[player.seekerThrowers.length - 1]);
        player.seekerThrowers.push(
          new SeekerThrower(
            createVector(player.sprite.width, player.sprite.height * 0.9),
            3,
            5,
            7,
            player
          )
        );
        weapons.push(player.seekerThrowers[player.seekerThrowers.length - 1]);
        return;
      case 11:
        // weapons.push(new LaserGun(5, 10, 0.2, 10, 4, player), "up");
        // createVector(player.sprite.width * 0.2 - 10, 5),
        // createVector(player.sprite.width * 0.8, 5)
        return;
    }
  }

  updateStats() {
    for (const blaster of player.bulletBlasters) {
      blaster.damage = blaster.baseDamage * this.damageMultiplier;
      blaster.fireDelay = blaster.baseFireDelay / this.fireDelayMultiplier;
    }
    for (const thrower of player.seekerThrowers) {
      thrower.damage = thrower.baseDamage * this.damageMultiplier;
      thrower.fireDelay = thrower.baseFireDelay / this.fireDelayMultiplier;
    }
    UI.test();
  }
}
