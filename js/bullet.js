class Projectile {
  constructor(position, weapon) {
    this.position = position.copy();
    this.damage = weapon.damage;
    this.size = weapon.projectileSize;
    this.type = weapon.type;
    this.speed = weapon.bulletSpeed;
    this.weapon = weapon;
    bullets.push(this);
  }

  update() {
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
    this.direction.normalize();
    this.direction.mult(this.speed);
    this.position.add(this.direction);
    this.show();
  }

  isOutOfBounds() {
    return (
      this.position.x < -100 ||
      this.position.x > width + 100 ||
      this.position.y < -100 ||
      this.position.y > height + 100
    );
  }

  show() {
    push();
    if (this.type === "player") {
      noStroke();
      fill(0, 0, 255);
    } else if (this.type === "enemy") {
      fill(255, 0, 0);
      stroke(255, 150, 150);
    }
    circle(this.position.x, this.position.y, this.size);
    pop();
  }

  destroy() {
    if (bullets.indexOf(this) != -1) {
      bullets.splice(bullets.indexOf(this), 1);
    }
  }
}

class Bullet extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.direction = this.weapon.direction.copy();
  }
}

class PlayerSeekerBullet extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.targetVector = createVector();
    this.speed = 2;
    if (enemyShips.length === 0) {
      this.targetVector = createVector(random(width), -150);
      this.target = 1;
    } else {
      this.target = enemyShips[round(random(enemyShips.length - 1))];
    }
  }

  update() {
    this.speed = lerp(this.speed, 50, 0.001);
    //if target ship no longer exists
    if (enemyShips.indexOf(this.target) === -1 && this.target != 1) {
      //if there is no enemy ship
      if (enemyShips.length === 0) {
        //send the bullet at a random vector above the canvas
        if (this.position.y > -100) {
          this.targetVector = createVector(random(width), -150);
          this.target = 1;
        }
      } else {
        //find a new target
        this.target = enemyShips[round(random(enemyShips.length - 1))];
      }
    }
    //if the missile has a target, set the bullet direction
    if (this.target != 1) {
      this.targetVector = this.target.hitbox.position.copy();
    }
    this.direction = this.targetVector.copy().sub(this.position);
    super.update();
  }

  show() {
    push();
    noStroke();
    fill(50, 50, 255);
    circle(this.position.x, this.position.y, this.size);
    fill(50, 255, 255);
    circle(this.position.x, this.position.y, this.size * 0.5);
    pop();
  }
}

class Laser {
  height = 0;
  #expandDuration;
  #expandTimer = 0;
  #windUpEffectSize;

  constructor(positionOffset, weapon) {
    this.positionOffset = positionOffset.copy();
    this.direction = weapon.direction;
    this.type = weapon.type;
    this.width = weapon.projectileSize;
    this.duration = 5;
    this.#expandDuration = this.duration * 0.2;
    this.creationTime = millis();
    this.damagePerSecond = weapon.damage;
    this.tickRate = weapon.tickRate;
    this.weapon = weapon;
    this.position = weapon.weaponOwner.position.copy().add(positionOffset);
    lasers.push(this);
  }

  update() {
    //destroy when duration runs out or if owner is dead
    if (
      millis() - this.creationTime >= this.duration * 1000 ||
      (this.type === "enemy" && enemyShips.indexOf(this.weapon.weaponOwner) === -1)
    ) {
      this.destroy();
      return;
    }
    //set its position to follow the ship that shoots it
    this.position = this.weapon.weaponOwner.position.copy().add(this.positionOffset);
    //expanding animation
    if (this.#expandTimer < this.#expandDuration * 1000) {
      this.height += (this.direction.y * height) / ((this.#expandDuration * 1000) / deltaTime);
      this.positionOffset.y +=
        (this.direction.y * height) / ((this.#expandDuration * 1000) / deltaTime) / 2;
      this.#expandTimer += deltaTime;
    }
    this.show();
  }

  show() {
    push();
    noStroke();
    if (this.type === "player") fill(50, 50, 255);
    else if (this.type === "enemy") fill(255, 50, 50);
    rect(this.position.x, this.position.y, this.width, this.height);
    if (this.type === "player") fill(200, 200, 255);
    else if (this.type === "enemy") fill(255, 200, 200);
    rect(this.position.x, this.position.y, this.width / 3, this.height);
    //create a shriking circle animation while the laser is expanding
    if (this.#expandTimer < this.#expandDuration * 1000) {
      circle(this.position.x, this.position.y - this.height / 2, this.#windUpEffectSize);
      this.#windUpEffectSize = constrain(
        50 - (50 * this.#expandTimer) / (this.#expandDuration * 1000),
        this.width + 5,
        50
      );
    } else {
      circle(this.position.x, this.position.y - this.height / 2, this.#windUpEffectSize);
    }
    pop();
  }

  destroy() {
    if (lasers.indexOf(this) != -1) {
      lasers.splice(lasers.indexOf(this), 1);
    }
  }
}

class EnginesFire {
  constructor(positionOffset, weapon) {
    this.positionOffset = positionOffset.copy();
    this.direction = weapon.direction;
    this.type = weapon.type;
    this.width = playerEnginesSprite.width;
    this.height = playerEnginesSprite.height;
    this.duration = weapon.enginesDuration;
    this.creationTime = millis();
    this.damagePerSecond = weapon.damage;
    this.tickRate = weapon.tickRate;
    this.weapon = weapon;
    this.position = weapon.weaponOwner.position.copy().add(positionOffset);
    lasers.push(this);
  }

  update() {
    //destroy when duration runs out
    if (millis() - this.creationTime >= this.duration * 1000) {
      this.destroy();
      return;
    }
    //set its position to follow the ship that shoots it
    this.position = this.weapon.weaponOwner.position.copy().add(this.positionOffset);
    this.show();
  }

  show() {
    image(playerEnginesSprite, this.position.x, this.position.y);
  }

  destroy() {
    if (lasers.indexOf(this) != -1) {
      lasers.splice(lasers.indexOf(this), 1);
    }
  }
}
