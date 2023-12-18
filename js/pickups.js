class PickUp {
  size = 20;
  speed = 1.5;
  direction = p5.Vector.random2D();

  constructor(position) {
    this.position = position;
    //check if out of bounds and put back in canvas
    if (this.position.x - this.size < 0) {
      this.position.x = 0 + this.size;
    } else if (this.position.x + this.size > width) {
      this.position.x = width - this.size;
    }
    if (this.position.y - this.size < 0) {
      this.position.y = 0 + this.size;
    } else if (this.position.y + this.size > height) {
      this.position.y = height - this.size;
    }
  }

  update() {
    this.direction.normalize();
    this.direction.mult(this.speed);
    this.position.add(this.direction);
    if (checkCollisionCircleRect(this, player.hitbox)) {
      this.onPickUp();
      this.destroy();
      return;
    }
    this.bounceOnBounds();
    this.show();
  }

  bounceOnBounds() {
    if (this.position.x + this.size / 2 > width || this.position.x - this.size / 2 < 0) {
      this.direction.x *= -1;
    }
    if (this.position.y + this.size / 2 > height || this.position.y - this.size / 2 < 0) {
      this.direction.y *= -1;
    }
  }

  destroy() {
    if (pickUps.indexOf(this) !== -1) {
      pickUps.splice(pickUps.indexOf(this), 1);
    }
  }
}

class HealthPickUp extends PickUp {
  show() {
    image(healthPickUpSprite, this.position.x, this.position.y);
  }

  onPickUp() {
    player.damageable.gainHealth(1);
  }
}

class BombPickUp extends PickUp {
  show() {
    image(bombPickUpSprite, this.position.x, this.position.y);
  }

  onPickUp() {
    background(200);
    bullets.length = 0;
    let i;
    i = enemyShips.length;
    while (i--) {
      enemyShips[i].damageable.takeDamage(100);
    }
  }
}
