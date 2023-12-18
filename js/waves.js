class SpawnManager {
  difficultyIndex = 0;

  difficulties = new Array(
    {
      enemies: new Array(
        { ship: Hawk, count: 2 },
        { ship: Raven, count: 1 },
        { ship: Pathfinder, count: 2 }
      ),
      enemiesIntervalTimer: 2,
      asteroidIntervalTimer: 0.8,
    },
    {
      enemies: new Array(
        { ship: Raven, count: 2 },
        { ship: Hawk, count: 3 },
        { ship: Pathfinder, count: 2 },
        { ship: Bomber, count: 1 }
      ),
      enemiesIntervalTimer: 1.9,
      asteroidIntervalTimer: 0.6,
    },
    {
      enemies: new Array(
        { ship: Raven, count: 3 },
        { ship: Hawk, count: 4 },
        { ship: Pathfinder, count: 3 },
        { ship: Bomber, count: 2 }
      ),
      enemiesIntervalTimer: 1.7,
      asteroidIntervalTimer: 0.4,
    },
    {
      enemies: new Array(
        { ship: Raven, count: 3 },
        { ship: Hawk, count: 5 },
        { ship: Pathfinder, count: 4 },
        { ship: Bomber, count: 3 },
        { ship: Zapper, count: 2 }
      ),
      enemiesIntervalTimer: 1.5,
      asteroidIntervalTimer: 0.3,
    },
    {
      enemies: new Array(
        { ship: Raven, count: 4 },
        { ship: Hawk, count: 6 },
        { ship: Pathfinder, count: 5 },
        { ship: Bomber, count: 4 },
        { ship: Zapper, count: 4 }
      ),
      enemiesIntervalTimer: 1,
      asteroidIntervalTimer: 0.1,
    }
  );

  constructor() {
    this.currentDifficulty = this.difficulties[this.difficultyIndex];
    this.currentInterval = setInterval(
      () => this.spawnAsteroid(),
      this.currentDifficulty.asteroidIntervalTimer * 1000
    );
    this.asteroidSetterInterval = setInterval(() => this.setAsteroidInterval(), 60 * 1000);
    setTimeout(() => {
      this.enemiesSetterInterval = setInterval(() => this.setEnemiesInterval(), 60 * 1000);
      this.setEnemiesInterval();
    }, 20 * 1000);
  }

  setAsteroidInterval() {
    clearInterval(this.currentInterval);
    this.difficultyIndex++;
    this.currentDifficulty = this.difficulties[this.difficultyIndex];
    this.currentInterval = setInterval(
      () => this.spawnAsteroid(),
      this.currentDifficulty.asteroidIntervalTimer * 1000
    );
  }

  setEnemiesInterval() {
    clearInterval(this.currentInterval);
    this.currentInterval = setInterval(
      () => this.generateEnemyWave(),
      this.currentDifficulty.enemiesIntervalTimer * 1000
    );
  }

  spawnAsteroid() {
    const spawn = this.getRandomTopSpawn();
    let endPoint = spawn.copy();
    endPoint.y = height + 200;
    enemyShips.push(new Asteroid([spawn, endPoint]));
  }

  generateEnemyWave() {
    const path = this.generateRandomPath();
    const ship = random(this.currentDifficulty.enemies);
    new EnemyWave(path, ship.ship, ship.count, random(0.4, 1.2));
  }

  generateRandomPath() {
    const spawnSide = random(["left", "right"]);
    const oppositeSide = spawnSide === "right" ? "left" : "right";
    const spawnPosition = this.getRandomSideSpawn(spawnSide);
    if (random() < 0.5) return this.straightPath(spawnPosition, oppositeSide);
    else return this.loopedPath(spawnPosition, oppositeSide);
  }

  getRandomSideSpawn(side) {
    const x = side === "right" ? width + 50 : -50;
    const y = random(-50, height - 150);
    return createVector(x, y);
  }

  getRandomSideDirectionPosition(spawn, side) {
    const x = side === "right" ? width + 200 : -200;
    const y = spawn.y < 10 ? random(10, height - 150) : random(-50, height - 150);
    return createVector(x, y);
  }

  getRandomTopSpawn() {
    const x = random(-20, width + 20);
    const y = -50;
    return createVector(x, y);
  }

  straightPath(from, to) {
    return [from, this.getRandomSideDirectionPosition(from, to)];
  }

  loopedPath(from, to) {
    const path = [from];
    const lastPos = this.getRandomSideDirectionPosition(from, to);
    const dir = p5.Vector.sub(lastPos, from);

    const midPoint = p5.Vector.add(from, p5.Vector.div(dir, 2));
    midPoint.add(createVector(random(-50, 50), 0));

    const loopWidth = random(50, 120);
    const loopHeight = random(-120, 120);
    const circleCenterX = midPoint.x;
    const circleCenterY = midPoint.y - loopHeight;
    const steps = 30;
    const loopDirection = lastPos.x < 0 ? 1 : -1;

    for (let index = 0; index < steps; index++) {
      const angle = 0.5 * PI + ((2 * PI) / steps) * index * loopDirection;
      const x = circleCenterX + cos(angle) * loopWidth;
      const y = circleCenterY + sin(angle) * loopHeight;
      path.push(createVector(x, y));
    }

    path.push(midPoint, lastPos);

    return path;
  }
}

class EnemyWave {
  #enemyCount = 0;

  constructor(path, enemyType, enemyCountTarget, delayBetweenSpawns) {
    this.path = path;
    this.enemyCountTarget = enemyCountTarget;
    this.enemyType = enemyType;
    this.delayBetweenSpawns = delayBetweenSpawns;
    let warningVector = createVector(0, path[0].y);
    if (path[0].x < 0) warningVector.x = warningSprite.width / 2 + 10;
    else warningVector.x = width - warningSprite.width / 2 - 10;
    spriteAnimations.push(new WarningAnimation(warningVector));
    this.interval = setInterval(() => this.spawnShip(), delayBetweenSpawns * 1000);
  }

  spawnShip() {
    {
      enemyShips.push(new this.enemyType(this.path));
      this.#enemyCount++;
      if (this.#enemyCount === this.enemyCountTarget) clearInterval(this.interval);
    }
  }
}
