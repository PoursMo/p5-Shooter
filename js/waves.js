class WaveManager {
  wavesToSpawn = new Array();

  constructor() {
    this.wavesToSpawn.push(
      new Wave(5, createVector(-50, -50), createVector(1, 1),0 , 1, 0)
    );
    this.wavesToSpawn.push(
      new Wave(5, createVector(width + 50, -50), createVector(-1, 1), 5, 1, 0)
    );
    this.wavesToSpawn.push(
      new Wave(4, createVector(-50, -50), createVector(1, 1), 10, 1, 0)
    );
    this.wavesToSpawn.push(
      new Wave(4, createVector(width + 50, -50), createVector(-1, 0), 10, 1, 0)
    );
    this.wavesToSpawn.push(
      new Wave(10, createVector(-40, -50), createVector(1, 1), 15, 0.5, 0)
    );
    this.wavesToSpawn.push(
      new Wave(
        10,
        createVector(width + 30, -50),
        createVector(-1, 1),
        15,
        0.5,
        1
      )
    );
    this.wavesToSpawn.push(
      new Wave(
        10,
        createVector(width + 30, -50),
        createVector(-1, 1),
        25,
        0.2,
        1
      )
    );
    this.wavesToSpawn.push(
      new Wave(10, createVector(-40, -50), createVector(1, 1), 30, 0.2, 0)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0, -50), createVector(0, 1), 35, 0, 1)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.1, -50), createVector(0, 1), 35, 0, 0)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.2, -50), createVector(0, 1), 35, 0, 1)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.3, -50), createVector(0, 1), 35, 0, 0)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.4, -50), createVector(0, 1), 35, 0, 1)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.5, -50), createVector(0, 1), 35, 0, 0)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.6, -50), createVector(0, 1), 35, 0, 1)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.7, -50), createVector(0, 1), 35, 0, 0)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.8, -50), createVector(0, 1), 35, 0, 1)
    );
    this.wavesToSpawn.push(
      new Wave(1, createVector(width * 0.9, -50), createVector(0, 1), 35, 0, 0)
    );
  }

  update() {
    for (const waveToSpawn of this.wavesToSpawn) {
      if (millis() - timeGameStart >= waveToSpawn.waveAppearanceTimer * 1000) {
        waves.push(waveToSpawn);
        this.wavesToSpawn.splice(
          this.wavesToSpawn.findIndex((x) => x === waveToSpawn),
          1
        );
      }
    }
    for (const wave of waves) {
      wave.update();
    }
  }
}

class Wave {
  enemyCount = 0;
  lastSpawnTimer = 0;

  constructor(
    enemyCountTarget,
    spawnPos,
    direction,
    waveAppearanceTimer,
    delay = 1,
    enemyType
  ) {
    this.enemyCountTarget = enemyCountTarget;
    this.spawnPos = spawnPos;
    this.direction = direction;
    this.waveAppearanceTimer = waveAppearanceTimer;
    this.delay = delay;
    this.enemyType = enemyType;
  }

  update() {
    if (
      this.enemyCount < this.enemyCountTarget &&
      millis() - this.lastSpawnTimer >= this.delay * 1000
    ) {
      enemyShips.push(
        new EnemyShip(
          this.spawnPos.copy(),
          this.direction.copy(),
          this.enemyType
        )
      );
      this.lastSpawnTimer = millis();
      this.enemyCount++;
    } else if (this.enemyCount >= this.enemyCountTarget) {
      this.destroy();
    }
  }

  destroy() {
    waves.splice(
      waves.findIndex((x) => x === this),
      1
    );
  }
}
