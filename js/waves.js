class WaveManager {
  totalWeightOptions = 0;
  weightTarget;
  currentWeight = 0;

  constructor() {
    this.waveOptions = new Array(
      new Wave(createVector(-50, -50), createVector(1, 1), 5, 0, 1),
      new Wave(createVector(width + 50, -50), createVector(-1, 1), 5, 0, 1),
      new Wave(createVector(width * 0.25, -50), createVector(0, 1), 5, 0, 1),
      new Wave(createVector(width * 0.5, -50), createVector(0, 1), 5, 0, 1),
      new Wave(createVector(width * 0.75, -50), createVector(0, 1), 5, 0, 1)
    );
    for (const wave of this.waveOptions) {
      this.totalWeightOptions += wave.weight;
    }
  }

  update() {
    this.currentWeight = 0;
    for (const wave of waves) {
      wave.update();
      this.currentWeight += wave.weight;
    }
    if (millis() - timeGameStart < 10 * 1000) {
      this.weightTarget = 10;
    }
    if (this.currentWeight < this.weightTarget) {
      this.rWave = this.pickRandomWaveBasedOnWeight();
      if (!this.rWave.isOngoing) {
        this.rWave.start();
        this.currentWeight += this.rWave.weight;
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
  #endTimer = 0;
  isOngoing = false;

  constructor(spawnPos, direction, enemyCountTarget, enemyType, delayBetweenSpawns) {
    this.spawnPos = spawnPos;
    this.direction = direction;
    this.enemyCountTarget = enemyCountTarget;
    this.enemyType = enemyType;
    this.delayBetweenSpawns = delayBetweenSpawns;
    //TO IMPROVE
    this.weight = enemyCountTarget * (enemyType + 1);
    print(this.weight);
  }

  update() {
    if (
      this.#enemyCount < this.enemyCountTarget &&
      millis() - this.#lastSpawnTimer >= this.delayBetweenSpawns * 1000
    ) {
      enemyShips.push(new EnemyShip(this.spawnPos.copy(), this.direction.copy(), this.enemyType));
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
