class Ship {
  constructor(sprite, pos, direction, size = 40) {
    this.size = size;
    this.sprite = sprite;
    this.sprite.resize(0, this.size);
    this.direction = direction;
    this.pos = pos;
    this.hitbox = {
      pos: createVector(this.pos.x, this.pos.y),
      width: this.sprite.width,
      height: this.sprite.height,
    };
  }

  update() {
    this.direction.normalize();
    this.pos.add(this.direction.mult(this.speed));
    this.hitbox.pos.x = this.pos.x;
    this.hitbox.pos.y = this.pos.y;
    this.show();
  }

  isOutOfBounds() {
    return (
      this.pos.x > width + 100 ||
      this.pos.x < -100 ||
      this.pos.y > height + 100 ||
      this.pos.y < -100
    );
  }

  show() {
    if (showHitbox) {
      push();
      noFill();
      stroke(0, 255, 0);
      rect(this.hitbox.pos.x, this.hitbox.pos.y, this.hitbox.width, this.hitbox.height);
      pop();
    }
    image(this.sprite, this.pos.x, this.pos.y);
  }
}

class EnemyShip extends Ship {
  hit = false;
  healthPickUpDropChance = 0.05;
  bombPickUpDropChance = 0.03;

  update() {
    super.update();
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    if (checkCollisionRectRect(this.hitbox, player.hitbox)) {
      this.getHit(100);
      playerStats.getHit(1);
      experiences.push(new Experience(this.pos));
      return;
    }
  }

  getHit(value) {
    this.hit = true;
    this.health -= value;
    if (this.health <= 0) {
      let s = createVector(this.pos.x + this.sprite.width / 2, this.pos.y + this.sprite.height / 2);
      experiences.push(new Experience(s.copy()));
      if (random() < this.healthPickUpDropChance) {
        pickUps.push(new HealthPickUp(s.copy()));
      }
      // if (random() < this.bombPickUpDropChance) {
      pickUps.push(new BombPickUp(s.copy()));
      // }
      this.destroy();
    }
  }

  show() {
    if (this.hit) {
      this.hit = false;
      return;
    }
    super.show();
  }

  destroy() {
    enemyShips.splice(enemyShips.indexOf(this), 1);
  }
}

class Hawk extends EnemyShip {
  bulletSize = 7;
  bulletSpeed = 4;
  speed = 2;
  health = 2;

  constructor(pos, direction) {
    super(hawkSprite, pos, direction);
    this.weapon = new BulletBlaster(
      createVector(0.5 * this.sprite.width, this.sprite.height),
      random(0.9, 1.5),
      1,
      this.bulletSize,
      this.bulletSpeed,
      this,
      "down"
    );
    weapons.push(this.weapon);
  }

  destroy() {
    this.weapon.destroy();
    super.destroy();
  }
}

class Pathfinder extends EnemyShip {
  speed = 3;
  health = 3;

  constructor(pos, direction) {
    super(pathfinderSprite, pos, direction, 30);
  }
}

class Raven extends EnemyShip {
  bulletSize = 7;
  bulletSpeed = 4;
  speed = 1.5;
  health = 2;

  constructor(pos, direction) {
    super(ravenSprite, pos, direction);
    this.weapon = new BulletBlaster(
      createVector(0.5 * this.sprite.width, this.sprite.height),
      random(0.9, 1.5),
      1,
      this.bulletSize,
      this.bulletSpeed,
      this,
      "atPlayer"
    );
    weapons.push(this.weapon);
  }

  destroy() {
    this.weapon.destroy();
    super.destroy();
  }

  shoot() {
    this.shootDir = player.pos.copy().sub(this.pos);
    new Bullet(
      createVector(this.pos.x + 0.5 * this.sprite.width, this.pos.y + this.sprite.height),
      this.shootDir,
      "enemy",
      this.bulletSpeed,
      this.bulletSize
    );
  }
}

class Boss extends EnemyShip {
  health = 1000;
  speed = 0.5;
  currentAttack;
  currentWeapons;
  bulletBlasters = new Array();
  laserGuns = new Array();
  seekerThrowers = new Array();

  constructor() {
    super(bossSprite, 0, createVector(0, 1), 250);
    this.pos = createVector(width / 2 - this.sprite.width / 2, -this.sprite.height);
    this.hitbox = {
      pos: createVector(),
      width: this.sprite.width - 80,
      height: this.sprite.height - 80,
    };
    this.bulletBlasters.push(
      new BulletBlaster(
        createVector(this.sprite.width * 0.74, this.sprite.height * 0.8),
        0.5,
        1,
        7,
        7,
        this,
        "down"
      )
    );
    this.bulletBlasters.push(
      new BulletBlaster(
        createVector(this.sprite.width * 0.26, this.sprite.height * 0.8),
        0.5,
        1,
        7,
        7,
        this,
        "down"
      )
    );
    this.seekerThrowers.push(
      new SeekerThrower(
        createVector(this.sprite.width * 0.74, this.sprite.height * 0.8),
        5,
        1,
        20,
        this
      )
    );
    this.seekerThrowers.push(
      new SeekerThrower(
        createVector(this.sprite.width * 0.26, this.sprite.height * 0.8),
        5,
        1,
        20,
        this
      )
    );
    this.attacks = new Array(this.minigunBlaster);
    this.newAttack(0);
  }

  update() {
    if (this.pos.y < 0) {
      this.direction.normalize();
      this.pos.add(this.direction.mult(this.speed));
      this.hitbox.pos.x = this.pos.x + 40;
      this.hitbox.pos.y = this.pos.y + 40;
    }
    if (checkCollisionRectRect(this.hitbox, player.hitbox)) {
      playerStats.getHit(1);
      this.getHit(1);
    }
    this.currentAttack();
    for (const weapon of this.currentWeapons) {
      weapon.update();
    }
    this.show();
  }

  newAttack(attackIndex) {
    let newAttack;
    if (attackIndex === undefined || attackIndex >= this.attacks.length) {
      newAttack = random(this.attacks);
    } else {
      newAttack = this.attacks[attackIndex];
    }
    this.currentAttack = newAttack;
    switch (newAttack) {
      case this.minigunBlaster:
        this.currentWeapons = [...this.bulletBlasters].concat(this.seekerThrowers);
        break;
      default:
        print("attack doesnt exist");
        break;
    }
  }

  #fireDelayModifierInitial = 5;
  #fireDelayModifier = this.#fireDelayModifierInitial;
  #fireDelayModifierTarget = 0.09;
  #dirXModifierTarget;
  #dirXModifier = 0;
  #dirXTarget = "left";
  #isGoingTo0 = true;
  minigunBlaster() {
    if (round(this.#fireDelayModifier, 2) > this.#fireDelayModifierTarget) {
      this.#fireDelayModifier = lerp(this.#fireDelayModifier, this.#fireDelayModifierTarget, 0.01);
      for (const blaster of this.bulletBlasters) {
        blaster.fireDelay = blaster.baseFireDelay * round(this.#fireDelayModifier, 2);
      }
    } else {
      if (
        this.#isGoingTo0 &&
        (round(this.#dirXModifier, 2) >= -0.01 || round(this.#dirXModifier, 2) <= 0.01)
      ) {
        this.#isGoingTo0 = false;
        if (this.#dirXTarget === "right") {
          this.#dirXModifierTarget = 0.5;
          this.#dirXTarget = "left";
        } else if (this.#dirXTarget === "left") {
          this.#dirXModifierTarget = -0.5;
          this.#dirXTarget = "right";
        }
      } else if (round(this.#dirXModifier, 1) <= -0.5 || round(this.#dirXModifier, 1) >= 0.5) {
        this.#dirXModifierTarget = 0;
        this.#isGoingTo0 = true;
      }
      this.#dirXModifier = lerp(this.#dirXModifier, this.#dirXModifierTarget, 0.01);
      for (const blaster of this.bulletBlasters) {
        blaster.dir.x = this.#dirXModifier;
      }
    }
  }

  destroy() {
    bossKilled = true;
    super.destroy();
  }
}
