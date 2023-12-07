class WaveManager {
  totalWeightOptions = 0;
  weightTarget;

  constructor() {
    this.waveOptions = new Array(
      //top left to down right
      new Wave(createVector(-50, -50), createVector(1, 1), 5, Hawk, 1),
      //top right to down left
      new Wave(createVector(width + 50, -50), createVector(-1, 1), 5, Hawk, 1),
      //top right to down left
      new Wave(createVector(width + 50, -50), createVector(-1, 1), 5, Raven, 1),
      //top right to down left
      new Wave(createVector(width + 50, -50), createVector(-1, 1), 5, Raven, 1),
      //top left straight down
      new Wave(createVector(width * 0.25, -50), createVector(0, 1), 5, Pathfinder, 1),
      //top middle straight down
      new Wave(createVector(width * 0.5, -50), createVector(0, 1), 5, Pathfinder, 1),
      //top right straight down
      new Wave(createVector(width * 0.75, -50), createVector(0, 1), 5, Pathfinder, 1)
    );
    for (const wave of this.waveOptions) {
      this.totalWeightOptions += wave.weight;
    }
  }

  update() {
    this.predictedEnemyCount = enemyShips.length;
    for (const wave of waves) {
      wave.update();
      this.predictedEnemyCount += wave.enemyCountTarget;
    }
    this.t = millis() - timeGameStart;
    if (this.t < 30 * 1000) {
      this.weightTarget = 10;
    } else if (this.t < 60 * 1000) {
      this.weightTarget = 15;
    } else if (this.t < 90 * 1000) {
      this.weightTarget = 100;
    }
    if (this.predictedEnemyCount < this.weightTarget) {
      this.rWave = this.pickRandomWaveBasedOnWeight();
      if (!this.rWave.isOngoing) {
        this.rWave.start();
      }
    }
  }

  pickRandomWaveBasedOnWeight() {
    this.w = 0;
    this.r = random(0, this.totalWeightOptions);
    for (const wave of this.waveOptions) {
      this.w += wave.weight;
      if (this.r < this.w) {
        return wave;
      }
    }
  }
}

class Wave {
  #enemyCount = 0;
  #lastSpawnTimer = 0;
  isOngoing = false;

  constructor(spawnPos, direction, enemyCountTarget, enemyType, delayBetweenSpawns) {
    this.spawnPos = spawnPos;
    this.direction = direction;
    this.enemyCountTarget = enemyCountTarget;
    this.enemyType = enemyType;
    this.delayBetweenSpawns = delayBetweenSpawns;
    //TO IMPROVE
    this.weight = enemyCountTarget;
  }

  update() {
    if (
      this.#enemyCount < this.enemyCountTarget &&
      millis() - this.#lastSpawnTimer >= this.delayBetweenSpawns * 1000
    ) {
      enemyShips.push(
        new this.enemyType(this.spawnPos.copy(), this.direction.copy(), this.enemyType)
      );
      this.#lastSpawnTimer = millis();
      this.#enemyCount++;
    } else if (this.#enemyCount >= this.enemyCountTarget) {
      this.destroy();
    }
  }

  start() {
    waves.push(this);
    this.isOngoing = true;
    this.#enemyCount = 0;
    this.#lastSpawnTimer = 0;
  }

  destroy() {
    this.isOngoing = false;
    waves.splice(waves.indexOf(this), 1);
  }
}
