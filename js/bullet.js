class Bullet {
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
          experiences.push(new Experience(ship.pos));
          ship.destroy();
          this.destroy();
          return;
        }
      }
    } else if (this.type === "enemy") {
      if (checkCollisionCircleRect(this, player.hitbox)) {
        if (player.getHit()) {
          this.destroy();
          return;
        }
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
      this.pos.x - this.size / 2 < -20 ||
      this.pos.x + this.size / 2 > width ||
      this.pos.y - this.size / 2 < -20 ||
      this.pos.y + this.size / 2 > height
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
  constructor(positionOffset, type, size) {
    super(positionOffset, createVector(), type, 1, size);
    this.target = enemyShips[floor(random(enemyShips.length))];
    this.targetVector = createVector();
  }

  update() {
    this.speed = lerp(this.speed, 50, 0.001);
    if (enemyShips.length === 0 && this.target === undefined) {
      this.target = { pos: p5.Vector.random2D(width,) };
      print(this.target);
    } else if (this.target === undefined) {
      //|| enemyShips.indexOf(this.target)
      this.target = enemyShips[round(random(enemyShips.length - 1))];
    }
    // print(enemyShips.indexOf(this.target));
    this.vel = this.pos.copy().sub(this.target.pos);
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
          experiences.push(new Experience(ship.pos));
          ship.destroy();
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
