class Bullet {
  damage = 1;
  constructor(positionOffset, direction, type, speed = 1, size = 5) {
    this.pos = positionOffset;
    this.vel = direction;
    this.size = size;
    this.type = type;
    this.speed = speed;
    bullets.push(this);
  }

  update() {
    this.vel.normalize();
    this.vel.mult(this.speed);
    this.pos.add(this.vel);
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
        player.getHit(this.damage);
        this.destroy();
        return;
      }
    }
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    this.show();
  }

  isOutOfBounds() {
    return (
      this.pos.x < -100 ||
      this.pos.x > width + 100 ||
      this.pos.y < -100 ||
      this.pos.y > height + 100
    );
  }

  show() {
    push();
    noStroke();
    if (this.type === "player") {
      fill(50, 50, 255);
    } else if (this.type === "enemy") {
      fill(255, 50, 50);
    }
    circle(this.pos.x, this.pos.y, this.size);
    pop();
  }

  destroy() {
    bullets.splice(bullets.indexOf(this), 1);
  }
}

class SeekerBullet extends Bullet {
  damage = 5;
  constructor(positionOffset, type, size) {
    super(positionOffset, createVector(), type, 1, size);
    this.target = enemyShips[floor(random(enemyShips.length))];
    this.targetVector = createVector();
  }

  update() {
    this.speed = lerp(this.speed, 50, 0.001);
    if (enemyShips.indexOf(this.target) === -1) {
      this.target = undefined;
    }
    if (this.target === undefined) {
      this.target = enemyShips[round(random(enemyShips.length - 1))];
    } else {
      this.targetVector = createVector(
        this.target.hitbox.pos.x + this.target.hitbox.width / 2,
        this.target.hitbox.pos.y + this.target.hitbox.height / 2
      );
    }
    this.vel = this.targetVector.copy().sub(this.pos);
    super.update();
  }

  show() {
    push();
    noStroke();
    fill(50, 50, 255);
    circle(this.pos.x, this.pos.y, this.size);
    fill(50, 255, 50);
    circle(this.pos.x, this.pos.y, this.size * 0.5);
    pop();
  }
}

class Laser {
  height = 0;
  expandDuration = 1;
  #expandTimer = 0;
  #windUpEffectSize;
  damage = 10;

  constructor(positionOffset, type, width, duration) {
    this.posOffset = positionOffset;
    this.type = type;
    this.width = width;
    this.duration = duration + this.expandDuration;
    this.creationTime = millis();
  }

  update() {
    if (millis() - this.creationTime >= this.duration * 1000) {
      this.destroy();
      return;
    }
    if (this.#expandTimer < this.expandDuration * 1000) {
      this.height -= height / ((this.expandDuration * 1000) / deltaTime);
      this.#expandTimer += deltaTime;
    }
    if (this.type === "player") {
      this.pos = player.pos.copy().add(this.posOffset);
      for (const ship of enemyShips) {
        if (checkCollisionRectRect(this, ship.hitbox)) {
          ship.getHit(this.damage);
        }
      }
    }
    this.show();
  }

  show() {
    push();
    noStroke();
    fill(50, 50, 255);
    rect(this.pos.x, this.pos.y, this.width, this.height);
    if (this.#expandTimer < this.expandDuration * 1000) {
      circle(this.pos.x + this.width / 2, this.pos.y, this.#windUpEffectSize);
      this.#windUpEffectSize = constrain(
        50 - (50 * this.#expandTimer) / (this.expandDuration * 1000),
        this.width + 5,
        50
      );
    } else {
      circle(this.pos.x + this.width / 2, this.pos.y, this.#windUpEffectSize);
    }
    pop();
  }

  destroy() {
    lasers.splice(lasers.indexOf(this), 1);
  }
}
