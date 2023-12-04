class Ship {
  constructor(sprite, pos, direction, size = 40) {
    this.size = size;
    this.sprite = sprite;
    this.sprite.resize(0, this.size);
    this.direction = direction;
    this.pos = pos;
    this.hitbox = {
      pos: createVector(this.pos.x, this.pos.y + 10),
      w: this.sprite.width,
      h: this.sprite.height - 10,
    };
  }

  update() {
    this.direction.normalize();
    this.pos.add(this.direction.mult(this.speed));
    this.hitbox.pos.x = this.pos.x;
    this.hitbox.pos.y = this.pos.y + 10;
    this.show();
  }

  show() {
    noFill();
    if (showHitbox) {
      push();
      stroke(0, 255, 0);
      rect(this.hitbox.pos.x, this.hitbox.pos.y, this.hitbox.w, this.hitbox.h);
      pop();
    }
    image(this.sprite, this.pos.x, this.pos.y);
  }
}
