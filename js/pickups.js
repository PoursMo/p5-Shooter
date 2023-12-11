class PickUp {
  size = 20;
  speed = 1.5;
  #lastChangeDirectionTime = millis();
  changeDirectionTimer = 3;

  constructor(position) {
    this.pos = position;
  }

  update() {
    if (millis() - this.#lastChangeDirectionTime >= this.changeDirectionTimer * 1000) {
      this.dir = p5.Vector.random2D();
      this.dir.normalize();
      this.dir.mult(this.speed);
      this.#lastChangeDirectionTime = millis();
    }
    this.pos.add(this.dir);
    if (checkCollisionCircleRect(this, player.hitbox)) {
      this.onPickUp();
      this.destroy();
      return;
    }
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    this.show();
  }

  show() {
    fill(255, 255, 50);
    noStroke();
    circle(this.pos.x, this.pos.y, this.size);
  }

  isOutOfBounds() {
    return (
      this.pos.x < -100 ||
      this.pos.x > width + 100 ||
      this.pos.y < -100 ||
      this.pos.y > height + 100
    );
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
