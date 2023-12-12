class Ship {
  constructor(sprite, position, direction, size = 40) {
    this.size = size;
    this.sprite = sprite;
    this.sprite.resize(0, this.size);
    this.direction = direction;
    this.position = position;
    this.hitbox = {
      position: createVector(),
      width: this.sprite.width,
      height: this.sprite.height,
    };
  }

  update() {
    this.direction.normalize();
    this.position.add(this.direction.mult(this.speed));
    this.hitbox.position.x = this.position.x;
    this.hitbox.position.y = this.position.y;
    this.show();
  }

  isOutOfBounds() {
    return (
      this.position.x > width + 100 ||
      this.position.x < -100 ||
      this.position.y > height + 100 ||
      this.position.y < -100
    );
  }

  show() {
    if (showHitbox) {
      push();
      noFill();
      stroke(0, 255, 0);
      rect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height);
      pop();
    }
    image(this.sprite, this.position.x, this.position.y);
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
      experiences.push(new Experience(this.position));
      return;
    }
  }

  getHit(value) {
    this.hit = true;
    this.health -= value;
    if (this.health <= 0) {
      experiences.push(new Experience(this.position.copy()));
      if (random() < this.healthPickUpDropChance) {
        pickUps.push(new HealthPickUp(this.position.copy()));
      }
      if (random() < this.bombPickUpDropChance) {
        pickUps.push(new BombPickUp(this.position.copy()));
      }
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

  constructor(position, direction) {
    super(hawkSprite, position, direction);
    this.weapon = new BulletBlaster(
      createVector(0, this.sprite.height / 2),
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

  constructor(position, direction) {
    super(pathfinderSprite, position, direction, 30);
  }
}

class Raven extends EnemyShip {
  bulletSize = 7;
  bulletSpeed = 4;
  speed = 1.5;
  health = 2;

  constructor(position, direction) {
    super(ravenSprite, position, direction);
    this.weapon = new BulletBlaster(
      createVector(0, this.sprite.height / 2),
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
    this.position = createVector(width / 2, -this.sprite.height);
    this.hitbox = {
      position: createVector(),
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
    if (this.position.y < 0) {
      this.direction.normalize();
      this.position.add(this.direction.mult(this.speed));
      this.hitbox.position.x = this.position.x + 40;
      this.hitbox.position.y = this.position.y + 40;
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
        blaster.direction.x = this.#dirXModifier;
      }
    }
  }

  destroy() {
    bossKilled = true;
    super.destroy();
  }
}
