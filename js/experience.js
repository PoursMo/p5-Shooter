class Experience {
  speed = 1;
  size = 1;

  constructor(position) {
    this.pos = position;
    this.dir = createVector();
  }

  update() {
    this.lerpModifier =
      dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) > 100
        ? 0.01
        : 0.1;
    this.speed = lerp(this.speed, 10, this.lerpModifier);
    this.dir.x = player.pos.x + player.sprite.width / 2;
    this.dir.y = player.pos.y + player.sprite.height / 2;
    this.dir.sub(this.pos);
    this.dir.normalize();
    this.pos.add(this.dir.mult(this.speed));
    if (checkCollisionCircleRect(this, player.hitbox)) {
      this.destroy();
      player.gainExperience();
    }
    this.show();
  }

  show() {
    push();
    fill(0, 255, 0);
    stroke(255);
    circle(this.pos.x, this.pos.y, this.size);
    pop();
  }

  destroy() {
    experiences.splice(
      experiences.findIndex((x) => x === this),
      1
    );
  }
}