class Ship {
  constructor(sprite, position) {
    this.sprite = sprite;
    this.position = position.copy();
  }

  update() {
    this.direction.normalize();
    this.position.add(this.direction.mult(this.stats.speed));
    this.hitbox.update();
    this.show();
  }

  show() {
    image(this.sprite, this.position.x, this.position.y);
  }
}

class EnemyShip extends Ship {
  hit = false;
  lastHitTime = 0;
  pathTargetIndex = 1;

  constructor(sprite, path) {
    super(sprite, path[0]);
    this.path = path;
    this.direction = p5.Vector.sub(this.path[this.pathTargetIndex], this.position);
  }

  update() {
    if (p5.Vector.dist(this.position, this.path[this.pathTargetIndex]) < 2) {
      this.pathTargetIndex++;
      this.direction = p5.Vector.sub(this.path[this.pathTargetIndex], this.position);
    }
    super.update();
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    this.damageable.update();
    //if collision with player
    if (
      (this.hitbox.shape === "rectangle" && checkCollisionRectRect(this.hitbox, player.hitbox)) ||
      (this.hitbox.shape === "circle" && checkCollisionCircleRect(this.hitbox, player.hitbox))
    ) {
      this.damageable.takeDamage(100);
      player.damageable.takeDamage(1);
    }
  }

  isOutOfBounds() {
    return (
      this.position.x > width + 100 ||
      this.position.x < -100 ||
      this.position.y > height + 100 ||
      this.position.y < -100
    );
  }

  onTakeDamage() {
    spriteAnimations.push(
      new SpriteAnimation(
        bubbleExplosionAnimationSpritesSmall,
        this.position
          .copy()
          .add(
            createVector(
              random(-this.hitbox.width / 2, this.hitbox.width / 2),
              random(this.hitbox.height / 2)
            )
          )
      )
    );
  }

  onDeath() {
    if (enemyShips.indexOf(this) !== -1) {
      if (this.stats.experienceDrop > 0)
        experiences.push(new Experience(this.position.copy(), this.stats.experienceDrop));
      if (random() < this.stats.healthPickUpDropChance)
        pickUps.push(new HealthPickUp(this.position.copy()));
      if (random() < this.stats.bombPickUpDropChance)
        pickUps.push(new BombPickUp(this.position.copy()));
      this.destroy();
    }
  }

  show() {
    if (this.hit) {
      this.hit = false;
      return;
    }
    // //show path
    // for (let index = 1; index < this.path.length; index++) {
    //   push();
    //   stroke(255, 0, 0);
    //   strokeWeight(5)
    //   line(this.path[index - 1].x, this.path[index - 1].y, this.path[index].x, this.path[index].y);
    //   pop();
    // }
    super.show();
  }

  destroy() {
    if (enemyShips.indexOf(this) !== -1) {
      enemyShips.splice(enemyShips.indexOf(this), 1);
      if (this.weapon) this.weapon.stopFiring();
    }
  }
}

class Hawk extends EnemyShip {
  stats = {
    maxHealth: 2,
    speed: 2,
    baseFireDelay: random(0.9, 1.4),
    baseDamage: 1,
    bulletSize: 7,
    bulletSpeed: 4,
    healthPickUpDropChance: 0.02,
    bombPickUpDropChance: 0.01,
    experienceDrop: 1,
  };
  damageable = new Damageable("player", "rectangle", this.stats.maxHealth, this);

  constructor(path) {
    super(hawkSprite, path);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new BulletBlasters(
      [createVector(0, this.sprite.height / 2)],
      1,
      this.stats.baseFireDelay,
      this.stats.baseDamage,
      this.stats.bulletSize,
      this.stats.bulletSpeed,
      this,
      "down"
    );
    this.weapon.startFiring();
  }

  destroy() {
    super.destroy();
  }
}

class Pathfinder extends EnemyShip {
  stats = {
    maxHealth: 3,
    speed: 2,
    healthPickUpDropChance: 0.02,
    bombPickUpDropChance: 0.01,
    experienceDrop: 1,
  };
  damageable = new Damageable("player", "rectangle", this.stats.maxHealth, this);

  constructor(path) {
    super(pathfinderSprite, path, 30);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
  }
}

class Asteroid extends EnemyShip {
  stats = {
    maxHealth: 5,
    speed: 1.5,
    healthPickUpDropChance: 0,
    bombPickUpDropChance: 0,
    experienceDrop: 0.5,
  };
  damageable = new Damageable("player", "circle", this.stats.maxHealth, this);

  constructor(path) {
    let randomSprites = random([asteroid1Sprites, asteroid2Sprites]);
    super(randomSprites[0], path);
    this.size = randomSprites[0].width;
    this.hitbox = new Hitbox("circle", this, createVector(), 0);
    this.animation = new SpriteAnimation(randomSprites, this, true);
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
  stats = {
    maxHealth: 2,
    speed: 1.5,
    baseFireDelay: random(1.4, 2),
    baseDamage: 1,
    bulletSize: 7,
    bulletSpeed: 4,
    healthPickUpDropChance: 0.02,
    bombPickUpDropChance: 0.01,
    experienceDrop: 1,
  };
  damageable = new Damageable("player", "rectangle", this.stats.maxHealth, this);

  constructor(path) {
    super(ravenSprite, path);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new BulletBlasters(
      [createVector(0, this.sprite.height / 2)],
      1,
      this.stats.baseFireDelay,
      this.stats.baseDamage,
      this.stats.bulletSize,
      this.stats.bulletSpeed,
      this,
      player
    );
    this.weapon.startFiring();
  }
}

class Bomber extends EnemyShip {
  stats = {
    maxHealth: 4,
    speed: 1.7,
    baseFireDelay: random(4.5, 5.5),
    baseDamage: 1,
    bulletSize: 20,
    healthPickUpDropChance: 0.01,
    bombPickUpDropChance: 0.05,
    experienceDrop: 1,
  };
  damageable = new Damageable("player", "rectangle", this.stats.maxHealth, this);

  constructor(path) {
    super(bomberSprite, path);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new EnemySeekerThrowers(
      [createVector(0, this.sprite.height / 2)],
      1,
      this.stats.baseFireDelay,
      this.stats.baseDamage,
      this.stats.bulletSize,
      this
    );
    this.weapon.startFiring();
  }
}

class Zapper extends EnemyShip {
  stats = {
    maxHealth: 2,
    speed: 1.5,
    baseFireDelay: random(1.8, 2.5),
    damagePerSeconds: 1,
    laserTickRate: 1,
    laserWidth: 15,
    laserDuration: 2,
    healthPickUpDropChance: 0.02,
    bombPickUpDropChance: 0.01,
    experienceDrop: 1,
  };
  damageable = new Damageable("player", "rectangle", this.stats.maxHealth, this);

  constructor(path) {
    super(zapperSprite, path);
    this.hitbox = new Hitbox("rectangle", this, createVector(), 0, 0);
    this.weapon = new LaserGuns(
      [createVector(0, this.sprite.height / 2)],
      1,
      this.stats.baseFireDelay,
      this.stats.damagePerSeconds,
      this.stats.laserTickRate,
      this.stats.laserWidth,
      this.stats.laserDuration,
      this,
      "down"
    );
    this.weapon.startFiring();
  }
}

class SeekerMissile extends EnemyShip {
  stats = {
    maxHealth: 2,
    speed: 2,
    healthPickUpDropChance: 0,
    bombPickUpDropChance: 0,
    experienceDrop: 0,
  };
  damageable = new Damageable("player", "circle", this.stats.maxHealth, this);

  constructor(position, weapon) {
    super(0, [position, player.position]);
    this.size = weapon.projectileSize;
    this.hitbox = new Hitbox("circle", this, createVector(), 0);
  }

  update() {
    this.stats.speed = lerp(this.stats.speed, 3, 0.001);
    this.direction = player.position.copy().sub(this.position);
    this.direction.normalize();
    this.position.add(this.direction.mult(this.stats.speed));
    this.hitbox.update();
    this.damageable.update();
    if (checkCollisionCircleRect(this.hitbox, player.hitbox)) {
      this.damageable.takeDamage(100);
      player.damageable.takeDamage(1);
    }
    this.show();
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

class Boss extends Ship {
  stats = {
    maxHealth: 1000,
    speed: 1,
    bulletBaseFireDelay: 3,
    bulletBaseDamage: 1,
    bulletBaseProjectileSize: 8,
    bulletBaseProjectileSpeed: 4.5,
    seekerBaseFireDelay: 5,
    seekerBaseDamage: 1,
    seekerProjectileSize: 30,
    laserDamagePerSeconds: 10,
    laserTickRate: 0.1,
    laserWidth: 200,
    laserDuration: 5,
    // healthPickUpDropChance: 0.02,
    // bombPickUpDropChance: 0.01,
    // experienceDrop: 1,
  };
  damageable = new Damageable("player", "rectangle", this.stats.maxHealth, this);

  constructor() {
    super(bossSprite, createVector(width / 2, -bossSprite.height / 2));
    this.direction = createVector(0, 1);
    this.hitbox = new Hitbox(
      "rectangle",
      this,
      createVector(),
      -bossSprite.width / 3,
      -bossSprite.height / 3
    );
    this.bulletBlasters = new BossBulletBlasters(
      [
        createVector(this.sprite.width * 0.24, (this.sprite.height / 2) * 0.6),
        createVector(this.sprite.width * -0.24, (this.sprite.height / 2) * 0.6),
      ],
      2,
      this.stats.bulletBaseFireDelay,
      this.stats.bulletBaseDamage,
      this.stats.bulletBaseProjectileSize,
      this.stats.bulletBaseProjectileSpeed,
      this,
      "down"
    );
    this.bulletBlasters2 = new BossBulletBlasters(
      [
        createVector(this.sprite.width * 0.24, (this.sprite.height / 2) * 0.6),
        createVector(this.sprite.width * -0.24, (this.sprite.height / 2) * 0.6),
      ],
      2,
      this.stats.bulletBaseFireDelay,
      this.stats.bulletBaseDamage,
      this.stats.bulletBaseProjectileSize,
      this.stats.bulletBaseProjectileSpeed,
      this,
      "down"
    );
    this.seekerThrowers = new EnemySeekerThrowers(
      [
        createVector(this.sprite.width * 0.24, (this.sprite.height / 2) * 0.6),
        createVector(this.sprite.width * -0.24, (this.sprite.height / 2) * 0.6),
      ],
      2,
      this.stats.seekerBaseFireDelay,
      this.stats.seekerBaseDamage,
      this.stats.seekerProjectileSize,
      this
    );
    this.laserGuns = new LaserGuns(
      [createVector(0, this.sprite.height / 2.5)],
      1,
      9999,
      this.stats.laserDamagePerSeconds,
      this.stats.laserTickRate,
      this.stats.laserWidth,
      this.stats.laserDuration,
      this,
      "down"
    );
    this.newAction(this.moveDown);
  }

  update() {
    super.update();
    if (this.actionToUpdate) this.actionToUpdate();
    this.damageable.update();
    if (checkCollisionRectRect(this.hitbox, player.hitbox)) {
      player.damageable.takeDamage(1);
      this.damageable.takeDamage(1);
    }
  }

  actions = [this.spawnShips, this.fireMinigun, this.fireLaser];

  newAction(action) {
    this.timeoutsAndIntervals = [];
    this.actionToUpdate = undefined;
    if (action !== undefined) this.currentAction = action;
    else {
      let randomAction = random(this.actions);
      while (randomAction === this.currentAction) randomAction = random(this.actions);
      this.currentAction = randomAction;
    }
    this.currentAction();
  }

  moveDown() {
    this.actionToUpdate = () => {
      if (this.position.y >= this.sprite.height / 3) {
        this.newAction();
        this.direction.y = 0;
      }
    };
  }

  wait(time = 1) {
    this.timeoutsAndIntervals.push(setTimeout(() => this.newAction(), time * 1000));
  }

  spawnShips() {
    this.seekerThrowers.startFiring();
    const spawnInterval = setInterval(() => {
      enemyShips.push(new Pathfinder([this.position, player.position]));
    }, 0.6 * 1000);
    this.timeoutsAndIntervals.push(
      spawnInterval,
      setTimeout(() => {
        this.seekerThrowers.stopFiring();
        clearInterval(spawnInterval);
        this.wait();
      }, 15 * 1000)
    );
  }

  fireMinigun() {
    this.bulletBlasters.fireDirection = createVector(0, 1);
    this.bulletBlasters2.fireDirection = createVector(0, 1);
    this.bulletBlasters.startFiring();
    this.bulletBlasters2.startFiring();
    this.timeoutsAndIntervals.push(
      setTimeout(() => {
        let directionTargetX1 = round(random(-1, 1), 1);
        let directionTargetX2 = round(random(-1, 1), 1);
        this.actionToUpdate = () => {
          if (round(this.bulletBlasters.fireDirection.x, 1) !== directionTargetX1)
            this.bulletBlasters.fireDirection.x = lerp(
              this.bulletBlasters.fireDirection.x,
              directionTargetX1,
              0.01
            );
          else directionTargetX1 = round(random(-1, 1), 1);
          if (round(this.bulletBlasters2.fireDirection.x, 1) !== directionTargetX2)
            this.bulletBlasters2.fireDirection.x = lerp(
              this.bulletBlasters2.fireDirection.x,
              directionTargetX2,
              0.01
            );
          else directionTargetX2 = round(random(-1, 1), 1);
        };
      }, 3 * 1000)
    );
    this.timeoutsAndIntervals.push(
      setTimeout(() => {
        this.bulletBlasters.stopFiring();
        this.bulletBlasters2.stopFiring();
        this.wait();
      }, 30 * 1000)
    );
  }

  laserWindUpTime = 1.2;
  fireLaser() {
    this.laserWindUpPosition = p5.Vector.add(this.position, this.laserGuns.positionOffsets[0]);
    this.laserWindUpSize = this.stats.laserWidth;
    this.actionToUpdate = () => {
      this.laserWindUpSize -= this.stats.laserWidth / ((this.laserWindUpTime * 1000) / deltaTime);
      push();
      fill(255, 100, 100);
      stroke(255, 200, 200);
      strokeWeight(3);
      circle(this.laserWindUpPosition.x, this.laserWindUpPosition.y, this.laserWindUpSize);
      pop();
    };
    this.timeoutsAndIntervals.push(
      setTimeout(() => {
        this.actionToUpdate = undefined;
        this.laserGuns.startFiring();
        this.seekerThrowers.fire();
        this.timeoutsAndIntervals.push(
          setTimeout(() => {
            this.laserGuns.stopFiring();
            this.wait();
          }, this.stats.laserDuration * 1000)
        );
      }, this.laserWindUpTime * 1000)
    );
  }

  clearTimeoutsAndIntervals() {
    for (let index = 0; index < this.timeoutsAndIntervals.length; index++) {
      clearInterval(this.timeoutsAndIntervals[index]);
      clearTimeout(this.timeoutsAndIntervals[index]);
    }
    this.bulletBlasters.stopFiring();
    this.bulletBlasters2.stopFiring();
    this.seekerThrowers.stopFiring();
    this.laserGuns.stopFiring();
  }

  onTakeDamage() {
    spriteAnimations.push(
      new SpriteAnimation(
        bubbleExplosionAnimationSpritesSmall,
        this.position
          .copy()
          .add(
            createVector(
              random(-this.hitbox.width / 2, this.hitbox.width / 2),
              random(this.hitbox.height / 2)
            )
          )
      )
    );
  }

  #explosions = 0;
  onDeath() {
    bossKilled = true;
    this.clearTimeoutsAndIntervals();
    setTimeout(() => {
      this.destroy();
    }, 1 * 1000);
    //explosions on the boss when he dies
    this.actionToUpdate = () => {
      if (this.#explosions < 20) {
        const anim = new SpriteAnimation(
          bubbleExplosionAnimationSprites,
          createVector(
            this.position.x + random(-this.sprite.width / 2, this.sprite.width / 2),
            this.position.y + random(-this.sprite.height / 2, this.sprite.height / 2)
          ),
          true
        );
        spriteAnimations.push(anim);
        setTimeout(() => {
          anim.destroy();
        }, 2 * 1000);
        this.#explosions++;
      }
    };
  }

  destroy() {
    if (enemyShips.indexOf(this) !== -1) {
      enemyShips.splice(enemyShips.indexOf(this), 1);
      if (this.weapon) this.weapon.stopFiring();
    }
  }
}
