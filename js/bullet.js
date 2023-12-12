class Projectile {
  constructor(position, weapon) {
    this.position = position.copy();
    this.damage = weapon.damage;
    this.size = weapon.projectileSize;
    this.type = weapon.type;
    this.speed = weapon.bulletSpeed;
    this.weapon = weapon;
    bullets.push(this);
  }

  update() {
    if (this.type === "player") {
      for (const ship of enemyShips) {
        if (checkCollisionCircleRect(this, ship.hitbox)) {
          ship.getHit(this.damage);
          this.destroy();
          return;
        }
      }
    } else if (this.type === "enemy") {
      if (checkCollisionCircleRect(this, player.hitbox)) {
        playerStats.getHit(this.damage);
        this.destroy();
        return;
      }
    }
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    this.direction.normalize();
    this.direction.mult(this.speed);
    this.position.add(this.direction);
    this.show();
  }

  isOutOfBounds() {
    return (
      this.position.x < -100 ||
      this.position.x > width + 100 ||
      this.position.y < -100 ||
      this.position.y > height + 100
    );
  }

  show() {
    push();
    if (this.type === "player") {
      noStroke();
      fill(0, 0, 255);
    } else if (this.type === "enemy") {
      fill(255, 0, 0);
      stroke(255, 150, 150);
    }
    circle(this.position.x, this.position.y, this.size);
    pop();
  }

  destroy() {
    bullets.splice(bullets.indexOf(this), 1);
  }
}

class Bullet extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.direction = this.weapon.direction.copy();
  }
}

class SeekerBullet extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.targetVector = createVector();
    this.speed = 2;
    if (this.type === "player") {
      if (enemyShips.length === 0) {
        this.targetVector = createVector(random(width), -150);
        this.target = 1;
      } else {
        this.target = enemyShips[round(random(enemyShips.length - 1))];
      }
    } else if (this.type === "enemy") {
      this.target = player;
    }
  }

  update() {
    if (this.type === "player") {
      this.speed = lerp(this.speed, 50, 0.001);
      //if target ship is dead
      if (enemyShips.indexOf(this.target) === -1 && this.target != 1) {
        //if there is no enemy ship
        if (enemyShips.length === 0) {
          if (this.position.y > -100) {
            this.targetVector = createVector(random(width), -150);
            this.target = 1;
          }
        } else {
          this.target = enemyShips[round(random(enemyShips.length - 1))];
        }
      }
    } else if (this.type === "enemy") {
      let i = bullets.length;
      while (i--) {
        if (bullets[i].type === "player") {
          if (checkCollisionCircleCircle(bullets[i], this)) {
            bullets[i].destroy();
            this.destroy();
            return;
          }
        }
      }
    }
    if (this.target != 1) {
      this.setTargetVector();
    }
    this.direction = this.targetVector.copy().sub(this.position);
    super.update();
  }

  setTargetVector() {
    this.targetVector = this.target.hitbox.position.copy();
  }

  show() {
    push();
    if (this.type === "player") {
      noStroke();
      fill(50, 50, 255);
      circle(this.position.x, this.position.y, this.size);
      fill(50, 255, 255);
      circle(this.position.x, this.position.y, this.size * 0.5);
    } else if (this.type === "enemy") {
      stroke(255, 150, 150);
      fill(255, 50, 50);
      circle(this.position.x, this.position.y, this.size);
      noStroke();
      fill(255, 255, 50);
      circle(this.position.x, this.position.y, this.size * 0.5);
    }
    pop();
  }
}

class Laser {
  height = 0;
  #expandDuration;
  #expandTimer = 0;
  #windUpEffectSize;
  #lastHitTime = 0;

  constructor(positionOffset, weapon) {
    this.positionOffset = positionOffset.copy();
    this.direction = weapon.direction;
    this.type = weapon.type;
    this.width = weapon.projectileSize;
    this.duration = weapon.laserDuration;
    this.#expandDuration = this.duration * 0.2;
    this.creationTime = millis();
    this.damagePerSecond = weapon.damage;
    this.tickRate = weapon.tickRate;
    this.weapon = weapon;
    lasers.push(this);
  }

  update() {
    //destroy when duration runs out
    if (millis() - this.creationTime >= this.duration * 1000) {
      this.destroy();
      return;
    }
    //set its position to follow the ship that shoots it
    this.position = this.weapon.weaponOwner.position.copy().add(this.positionOffset);
    //expanding animation
    if (this.#expandTimer < this.#expandDuration * 1000) {
      this.height -= height / ((this.#expandDuration * 1000) / deltaTime);
      this.positionOffset.y -= height / ((this.#expandDuration * 1000) / deltaTime) / 2;
      this.#expandTimer += deltaTime;
    }
    if (millis() - this.#lastHitTime >= this.tickRate * 1000) {
      if (this.type === "player") {
        for (const ship of enemyShips) {
          if (checkCollisionRectRect(this, ship.hitbox)) {
            ship.getHit(this.damagePerSecond * this.tickRate);
            this.#lastHitTime = millis();
          }
        }
      }
    }
    this.show();
  }

  show() {
    push();
    noStroke();
    fill(50, 50, 255);
    rect(this.position.x, this.position.y, this.width, this.height);
    //create a shriking circle animation while the laser is expanding
    if (this.#expandTimer < this.#expandDuration * 1000) {
      circle(this.position.x, this.position.y - this.height / 2, this.#windUpEffectSize);
      this.#windUpEffectSize = constrain(
        50 - (50 * this.#expandTimer) / (this.#expandDuration * 1000),
        this.width + 5,
        50
      );
    } else {
      circle(this.position.x, this.position.y - this.height / 2, this.#windUpEffectSize);
    }
    pop();
  }

  destroy() {
    lasers.splice(lasers.indexOf(this), 1);
  }
}
