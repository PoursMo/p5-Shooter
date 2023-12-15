class Ship {
  constructor(sprite, position, direction) {
    this.direction = direction;
    this.position = position;
    this.sprite = sprite;
  }

  update() {
    this.direction.normalize();
    this.position.add(this.direction.mult(this.speed));
    this.hitbox.update();
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
    image(this.sprite, this.position.x, this.position.y);
  }
}

class EnemyShip extends Ship {
  hit = false;
  healthPickUpDropChance = 0.02;
  bombPickUpDropChance = 0.01;
  lastHitTime = 0;

  constructor(sprite, position, direction) {
    super(sprite, position, direction);
  }

  update() {
    super.update();
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    this.damageable.update();
    if (
      (this.hitbox.shape === "rectangle" && checkCollisionRectRect(this.hitbox, player.hitbox)) ||
      (this.hitbox.shape === "circle" && checkCollisionCircleRect(this.hitbox, player.hitbox))
    ) {
      this.damageable.takeDamage(100);
      player.damageable.takeDamage(1);
    }
    if (this.weapon) {
      this.weapon.update();
    }
  }

  onTakeDamage() {
    spriteAnimations.push(
      new SpriteAnimation(
        bubbleExplosionSpritesSmall,
        this.position
          .copy()
          .add(
            createVector(
              random(-this.sprite.width / 2, this.sprite.width / 2),
              random(this.sprite.height / 2)
            )
          )
      )
    );
  }

  onDeath() {
    experiences.push(new Experience(this.position.copy()));
    if (random() < this.healthPickUpDropChance) {
      pickUps.push(new HealthPickUp(this.position.copy()));
    }
    if (random() < this.bombPickUpDropChance) {
      pickUps.push(new BombPickUp(this.position.copy()));
    }
    this.destroy();
  }

  show() {
    if (this.hit) {
      this.hit = false;
      return;
    }
    super.show();
  }

  destroy() {
    if (enemyShips.indexOf(this) != -1) {
      enemyShips.splice(enemyShips.indexOf(this), 1);
    }
  }
}

class Hawk extends EnemyShip {
  bulletSize = 7;
  bulletSpeed = 4;
  fireDelay = 1;
  speed = 2;
  maxHealth = 2;
  damageable = new Damageable("player", "rectangle", this.maxHealth, this);

  constructor(position, direction) {
    super(hawkSprite, position, direction);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new BulletBlaster(
      createVector(0, this.sprite.height / 2),
      random(this.fireDelay - 0.2, this.fireDelay + 0.5),
      1,
      this.bulletSize,
      this.bulletSpeed,
      this,
      "down"
    );
  }

  destroy() {
    super.destroy();
  }
}

class Pathfinder extends EnemyShip {
  speed = 3;
  maxHealth = 3;
  damageable = new Damageable("player", "rectangle", this.maxHealth, this);

  constructor(position, direction) {
    super(pathfinderSprite, position, direction, 30);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
  }
}

class Asteroid extends EnemyShip {
  speed = 1.5;
  maxHealth = 5;
  damageable = new Damageable("player", "circle", this.maxHealth, this);

  constructor(position, direction) {
    let randomSprites = random(asteroidsSprites);
    super(randomSprites[0], position, direction);
    this.size = randomSprites[0].width;
    this.hitbox = new Hitbox("circle", this, createVector(), 0);
    this.animation = new SpriteAnimation(randomSprites, this, true);
  }

  update() {
    super.update();
  }

  show() {
    if (this.hit) {
      this.hit = false;
      return;
    }
    this.animation.update();
  }
}

class Raven extends EnemyShip {
  bulletSize = 7;
  bulletSpeed = 4;
  fireDelay = 1;
  speed = 1.5;
  maxHealth = 2;
  damageable = new Damageable("player", "rectangle", this.maxHealth, this);

  constructor(position, direction) {
    super(ravenSprite, position, direction);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new BulletBlaster(
      createVector(0, this.sprite.height / 2),
      random(this.fireDelay - 0.2, this.fireDelay + 0.5),
      1,
      this.bulletSize,
      this.bulletSpeed,
      this,
      "atPlayer"
    );
  }

  destroy() {
    super.destroy();
  }
}

class Bomber extends EnemyShip {
  speed = 1.7;
  maxHealth = 4;
  fireDelay = 5;
  bulletSize = 20;
  damageable = new Damageable("player", "rectangle", this.maxHealth, this);

  constructor(position, direction) {
    super(bomberSprite, position, direction);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new SeekerThrower(
      createVector(0, this.sprite.height / 2),
      random(this.fireDelay - 0.5, this.fireDelay + 0.5),
      1,
      this.bulletSize,
      this
    );
  }

  destroy() {
    super.destroy();
  }
}

class Zapper extends EnemyShip {
  speed = 1.5;
  maxHealth = 2;
  fireDelay = 2;
  laserWidth = 15;
  damageable = new Damageable("player", "rectangle", this.maxHealth, this);

  constructor(position, direction) {
    super(zapperSprite, position, direction);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new LaserGun(
      createVector(0, this.sprite.height / 2),
      random(this.fireDelay - 0.2, this.fireDelay + 0.5),
      1,
      1,
      this.laserWidth,
      2,
      this,
      "down"
    );
  }

  destroy() {
    super.destroy();
  }
}

class SeekerMissile extends EnemyShip {
  speed = 2;
  maxHealth = 2;
  damageable = new Damageable("player", "circle", this.maxHealth, this);

  constructor(position, weapon) {
    super(0, position, undefined);
    this.size = weapon.projectileSize;
    this.hitbox = new Hitbox("circle", this, createVector(), 0);
  }

  update() {
    this.speed = lerp(this.speed, 3, 0.001);
    this.direction = player.position.copy().sub(this.position);
    this.direction.normalize();
    this.position.add(this.direction.mult(this.speed));
    this.hitbox.update();
    this.damageable.update();
    if (checkCollisionCircleRect(this.hitbox, player.hitbox)) {
      this.damageable.takeDamage(100);
      player.damageable.takeDamage(1);
    }
    this.show();
  }

  onDeath() {
    this.destroy();
  }

  show() {
    if (this.hit) {
      this.hit = false;
      return;
    }
    push();
    stroke(255, 150, 150);
    fill(255, 50, 50);
    circle(this.position.x, this.position.y, this.size);
    noStroke();
    fill(255, 255, 50);
    circle(this.position.x, this.position.y, this.size * 0.5);
    pop();
  }
}

class Boss extends EnemyShip {
  maxHealth = 1000;
  speed = 0.5;
  currentAttack;
  currentWeapons;
  bulletBlasters = new Array();
  laserGuns = new Array();
  seekerThrowers = new Array();

  constructor() {
    super(bossSprite, 0, createVector(0, 1));
    this.position = createVector(width / 2, -this.sprite.height / 2);
    this.hitbox = {
      position: createVector(),
      width: this.sprite.width - 80,
      height: this.sprite.height - 80,
    };
    this.bulletBlasters.push(
      new BulletBlaster(
        createVector(this.sprite.width * 0.24, (this.sprite.height / 2) * 0.6),
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
        createVector(this.sprite.width * -0.24, (this.sprite.height / 2) * 0.6),
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
        createVector(this.sprite.width * 0.24, (this.sprite.height / 2) * 0.6),
        5,
        1,
        20,
        this
      )
    );
    this.seekerThrowers.push(
      new SeekerThrower(
        createVector(this.sprite.width * -0.24, (this.sprite.height / 2) * 0.6),
        5,
        1,
        20,
        this
      )
    );
    this.attacks = new Array(this.minigunBlaster);
    this.newAttack(0);
  }

  #explosions = 0;

  update() {
    if (bossKilled) {
      if (this.#explosions < 20) {
        spriteAnimations.push(
          new SpriteAnimation(
            bubbleExplosionSprites,
            createVector(
              this.position.x + random(-this.sprite.width / 2, this.sprite.width / 2),
              this.position.y + random(-this.sprite.height / 2, this.sprite.height / 2)
            ),
            true
          )
        );
        this.#explosions++;
      }
      this.show();
      return;
    }
    if (this.position.y < this.sprite.height / 2) {
      this.direction.normalize();
      this.position.add(this.direction.mult(this.speed));
      this.hitbox.position.x = this.position.x;
      this.hitbox.position.y = this.position.y + 10;
    }
    this.currentAttack();
    for (const weapon of this.currentWeapons) {
      weapon.update();
    }
    this.show();
    this.damageable.update();
    if (checkCollisionRectRect(this.hitbox, player.hitbox)) {
      player.damageable.takeDamage(1);
      this.damageable.takeDamage(1);
    }
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

  onDeath() {
    bossKilled = true;
    for (let index = 0; index < 100; index++) {
      experiences.push(new Experience(this.position.copy()));
    }
  }
}
