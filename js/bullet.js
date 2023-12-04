class Bullet {
  constructor(position, direction, type, speed = 1, size = 5) {
    this.pos = position;
    this.vel = direction;
    this.size = size;
    this.type = type;
    this.speed = speed;
    if (this.type === "player") {
      playerBullets.push(this);
    } else if (this.type === "enemy") {
      enemyBullets.push(this);
    }
  }

  update() {
    this.vel.normalize();
    this.vel.mult(this.speed);
    this.pos.add(this.vel);
    if (this.pos.y < -20) {
      this.destroy();
      //
      //
      //ADD BOUNDS CHECK
      //
      //
    } else {
      this.show();
    }
  }

  show() {
    push();
    if (this.type === "player") {
      fill(255, 255, 0);
      stroke(255);
    } else if (this.type === "enemy") {
      fill(255, 0, 0);
      stroke(255, 0, 0);
    }
    circle(this.pos.x, this.pos.y, this.size);
    pop();
  }

  destroy() {
    if (this.type === "player") {
      playerBullets.splice(
        playerBullets.findIndex((x) => x === this),
        1
      );
    } else if (this.type === "enemy") {
      enemyBullets.splice(
        enemyBullets.findIndex((x) => x === this),
        1
      );
    }
  }
}

class SeekerBullet extends Bullet {
  constructor(position, type) {
    super(position, createVector(), type, 1, 5);
    this.target = enemyShips[floor(random(enemyShips.length))];
    this.targetVector = createVector();
  }

  update() {
    if (this.target === undefined) {
      this.vel = p5.Vector.random2D();
    } else {
      this.targetVector.x = random(
        this.target.hitbox.pos.x,
        this.target.hitbox.w
      );
      this.targetVector.y = random(
        this.target.hitbox.pos.y,
        this.target.hitbox.h
      );
      this.vel = this.targetVector.sub(this.pos);
      this.lerpModifier =
        dist(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y) > 100
          ? 0.01
          : 0.5;
      this.speed = lerp(this.speed, 10, this.lerpModifier);
    }
    super.update();
  }

  show() {
    push();
    fill(50, 50, 255);
    stroke(255);
    circle(this.pos.x, this.pos.y, this.size);
    pop();
  }
}
