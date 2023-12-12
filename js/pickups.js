class PickUp {
  size = 20;
  speed = 1.5;
  dir = p5.Vector.random2D();

  constructor(position) {
    this.pos = position;
    //check if out of bounds and put back in canvas
    if (this.pos.x - this.size < 0) {
      this.pos.x = 0 + this.size;
    } else if (this.pos.x + this.size > width) {
      this.pos.x = width - this.size;
    }
    if (this.pos.y - this.size < 0) {
      this.pos.y = 0 + this.size;
    } else if (this.pos.y + this.size > height) {
      this.pos.y = height - this.size;
    }
  }

  update() {
    this.dir.normalize();
    this.dir.mult(this.speed);
    this.pos.add(this.dir);
    if (checkCollisionCircleRect(this, player.hitbox)) {
      this.onPickUp();
      this.destroy();
      return;
    }
    this.bounceOnBounds();
    this.show();
  }

  bounceOnBounds() {
    if (this.pos.x + this.size / 2 > width || this.pos.x - this.size / 2 < 0) {
      this.dir.x *= -1;
    }
    if (this.pos.y + this.size / 2 > height || this.pos.y - this.size / 2 < 0) {
      this.dir.y *= -1;
    }
  }

  show() {
    fill(255, 255, 50);
    noStroke();
    circle(this.pos.x, this.pos.y, this.size);
  }

  destroy() {
    pickUps.splice(pickUps.indexOf(this), 1);
  }
}

class HealthPickUp extends PickUp {
  show() {
    push();
    super.show();
    textSize(this.size);
    fill(255, 50, 50);
    text("♥", this.pos.x, this.pos.y);
    pop();
  }

  onPickUp() {
    playerStats.gainHealth();
  }
}

class BombPickUp extends PickUp {
  show() {
    push();
    super.show();
    textSize(this.size);
    fill(255, 50, 50);
    text("B", this.pos.x, this.pos.y);
    pop();
  }

  onPickUp() {
    bullets.length = 0;
    let i;
    i = enemyShips.length;
    while (i--) {
      enemyShips[i].getHit(100);
    }
  }
}
