class PlayerShip extends Ship {
  #lastHitTime = 0;
  health = 3;
  speed = 5;
  invulTime = 0.2;
  experience = 0;
  level = 1;
  direction = createVector();

  constructor(sprite) {
    super(sprite, 0, 0, 35);
    this.pos = createVector(width / 2 - this.sprite.width / 2, height - this.size - 20);
    this.hitbox = {
      pos: createVector(this.pos.x + 4, this.pos.y + 12),
      width: this.sprite.width - 8,
      height: this.sprite.height - 15,
    };
  }

  update() {
    this.handleControls();
    this.direction.normalize();
    this.pos.add(this.direction.mult(this.speed));
    this.boundsCollision();
    this.hitbox.pos.x = this.pos.x + 4;
    this.hitbox.pos.y = this.pos.y + 12;
    this.show();
  }

  show() {
    super.show();
  }

  boundsCollision() {
    if (this.pos.x < 0) {
      this.pos.x = 0;
    } else if (this.pos.x + this.sprite.width > width) {
      this.pos.x = width - this.sprite.width;
    }
    if (this.pos.y < 0) {
      this.pos.y = 0;
    } else if (this.pos.y + this.sprite.height > height) {
      this.pos.y = height - this.sprite.height;
    }
  }

  getHit(value) {
    if (millis() - this.#lastHitTime >= this.invulTime * 1000) {
      this.health -= value;
      background(255, 0, 0);
      this.#lastHitTime = millis();
      if (this.health <= 0) {
        gameOver();
      }
    }
  }

  gainExperience() {
    this.experience++;
    if (this.experience % 10 === 0) {
      this.levelUp();
      this.experience = 0;
    }
  }

  levelUp() {
    this.level++;
    switch (this.level) {
      case 3:
        weapons.push(new SeekerThrower(3, 7));
        return;
      case 5:
        weapons.push(new LaserGun(5, 10, 4));
        return;
    }
    weapons[round(random(weapons.length - 1))].levelUp();
  }

  handleControls() {
    //Left
    if (keyIsDown(65) || keyIsDown(37)) {
      this.direction.x = -1;
    }
    //Right
    else if (keyIsDown(68) || keyIsDown(39)) {
      this.direction.x = 1;
    } else {
      this.direction.x = 0;
    }
    //Up
    if (keyIsDown(87) || keyIsDown(38)) {
      this.direction.y = -1;
    }
    //Down
    else if (keyIsDown(83) || keyIsDown(40)) {
      this.direction.y = 1;
    } else {
      this.direction.y = 0;
    }
    //Space
    if (keyIsDown(32)) {
    }
  }
}
