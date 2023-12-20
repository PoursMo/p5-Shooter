class Projectile {
  constructor(position, weapon) {
    this.position = position.copy();
    this.damage = weapon.damage;
    this.size = weapon.projectileSize;
    this.type = weapon.type;
    this.speed = weapon.projectileSpeed;
    this.weapon = weapon;
  }

  update() {
    this.direction.normalize();
    this.direction.mult(this.speed);
    this.position.add(this.direction);
    if (this.isOutOfBounds()) {
      this.destroy();
      return;
    }
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
    if (bullets.indexOf(this) !== -1) {
      bullets.splice(bullets.indexOf(this), 1);
    }
  }
}

class Blade extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.direction = this.weapon.fireDirection.copy();
    this.width = bladeSprite.width;
    this.height = bladeSprite.height;
    blades.push(this);
  }
  show() {
    image(bladeSprite, this.position.x, this.position.y);
  }
  destroy() {
    if (blades.indexOf(this) !== -1) {
      blades.splice(blades.indexOf(this), 1);
    }
  }
}
class Bullet extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.direction = this.weapon.fireDirection.copy();
    bullets.push(this);
  }
}

class PlayerSeekerBullet extends Projectile {
  constructor(position, weapon) {
    super(position, weapon);
    this.speed = 2;
    if (enemyShips.length === 0) {
      //if there is no enemy, send the bullet to a random position above the canvas
      this.targetVector = createVector(random(width), -150);
      this.target = 1;
    } else {
      //if there are enemies, pick one at random to be the target
      this.target = enemyShips[round(random(enemyShips.length - 1))];
    }
    bullets.push(this);
  }

  update() {
    this.speed = lerp(this.speed, 50, 0.001);
    //if target ship no longer exists
    if (enemyShips.indexOf(this.target) === -1 && this.target !== 1) {
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
    if (this.target !== 1) {
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
    this.direction = weapon.fireDirection;
    this.type = weapon.type;
    this.width = weapon.laserWidth;
    this.#expandDuration = weapon.laserDuration * 0.1;
    this.creationTime = millis();
    this.damagePerSeconds = weapon.damagePerSeconds;
    this.tickRate = weapon.tickRate;
    this.weapon = weapon;
    this.position = weapon.weaponOwner.position.copy().add(positionOffset);
    lasers.push(this);
    setTimeout(() => this.destroy(), weapon.laserDuration * 1000);
  }

  update() {
    //destroy if owner is dead
    if (this.type === "enemy" && enemyShips.indexOf(this.weapon.weaponOwner) === -1) {
      this.destroy();
      return;
    }
    //expanding animation
    if (this.#expandTimer < this.#expandDuration * 1000) {
      this.height += (this.direction.y * height) / ((this.#expandDuration * 1000) / deltaTime);
      this.positionOffset.y +=
        (this.direction.y * height) / ((this.#expandDuration * 1000) / deltaTime) / 2;
      this.#expandTimer += deltaTime;
    }
    //set its position to follow the ship that shoots it
    this.position = this.weapon.weaponOwner.position.copy().add(this.positionOffset);
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
    if (lasers.indexOf(this) !== -1) {
      lasers.splice(lasers.indexOf(this), 1);
    }
  }
}

class PlayerEngines {
  enginesDuration = 2;
  tickRate = 0.7;
  weaponCount = 1;
  positionOffset = createVector(0, player.sprite.height / 2 + playerEnginesSprite.height / 2 - 3);
  position = player.position.copy().add(this.positionOffset);
  type = "player";
  width = playerEnginesSprite.width;
  height = playerEnginesSprite.height;
  damagePerSeconds = 10;
  tickRate = 0.4;
  isActive;

  update() {
    //set its position to follow the player
    this.position = player.position.copy().add(this.positionOffset);
    this.show();
  }

  show() {
    image(playerEnginesSprite, this.position.x, this.position.y);
  }
}
