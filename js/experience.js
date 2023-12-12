class Experience {
  speed = 1;
  size = 3;

  constructor(position) {
    this.position = position;
    this.direction = createVector();
  }

  update() {
    this.lerpModifier =
      dist(this.position.x, this.position.y, player.position.x, player.position.y) > 100
        ? 0.01
        : 0.1;
    this.speed = lerp(this.speed, 10, this.lerpModifier);
    this.direction = player.position.copy();
    this.direction.sub(this.position);
    this.direction.normalize();
    this.position.add(this.direction.mult(this.speed));
    if (checkCollisionCircleRect(this, player.hitbox)) {
      playerStats.gainExperience();
      this.destroy();
      return;
    }
    this.show();
  }

  show() {
    push();
    fill(0, 255, 0);
    noStroke();
    circle(this.position.x, this.position.y, this.size);
    pop();
  }

  destroy() {
    experiences.splice(experiences.indexOf(this), 1);
  }
}
