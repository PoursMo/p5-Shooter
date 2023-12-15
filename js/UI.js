class UI {
  playButton;

  constructor() {
    this.multipliersUI = createP();
    this.multipliersUI.addClass("weaponUI");
  }

  updateStats() {
    //BITE
    // this.multipliersUI.html(
    //   "Fire rate: " +
    //     round(playerStats.fireDelayMultiplier * 100) +
    //     "%<br>Damage: " +
    //     round(playerStats.damageMultiplier * 100) +
    //     "%"
    // );
  }

  update() {
    if (isGameRunning) {
      this.showExperience();
      this.showHealth();
      this.showLevel();
      this.showTime();
    }
    if (bossKilled) {
      this.showWinScreen();
    }
    if (isGameOver) {
      this.showGameOverScreen();
    }
  }

  showGameOverScreen() {
    push();
    fill(255, 75, 75);
    noStroke();
    textFont(pixelFont);
    textSize(20);
    let minutes = floor(gameTimer / 1000 / 60);
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = floor((gameTimer / 1000) % 60);
    if (seconds < 10) seconds = "0" + seconds;
    text("You survived\n" + minutes + "m" + seconds + "s", width / 2, height / 1.5);
    pop();
  }

  showWinScreen() {
    push();
    fill(255, 75, 75);
    noStroke();
    textFont(pixelFont);
    textSize(40);
    text("YOU WON\n(for now)\nEsc to restart", width / 2, height / 2);
    pop();
  }

  showTime() {
    let minutes = floor(gameTimer / 1000 / 60);
    if (minutes < 10) minutes = "0" + minutes;
    let seconds = floor((gameTimer / 1000) % 60);
    if (seconds < 10) seconds = "0" + seconds;
    push();
    fill(200);
    textSize(15);
    textFont(pixelFont);
    text(minutes + ":" + seconds, width / 2, 40);
    pop();
  }

  showHealth() {
    push();
    fill(255, 50, 50);
    noStroke();
    textSize(20);
    text(
      "❤".repeat(player.damageable.health) +
        "♡".repeat(player.damageable.maxHealth - player.damageable.health),
      width / 2,
      20
    );
    pop();
  }

  showLevel() {
    push();
    textFont(pixelFont);
    noStroke();
    fill(200);
    textSize(15);
    text("level : " + playerStats.level, width - 70, 27);
    pop();
  }

  showExperience() {
    push();
    stroke(255, 0, 0);
    fill(0, 255, 0);
    stroke(0);
    rect(0, 0, (playerStats.experience * width) / 10, 10);
    pop();
  }

  showPlayButton() {
    if (this.playButton === undefined) {
      let d = createDiv();
      d.addClass("wrapper");
      this.playButton = createImg("./assets/UI/play_button.png", "");
      // this.playButton.style("font-size", "35px");
      // this.playButton.size(150, 70);
      this.playButton.parent(d);
      this.playButton.mouseOver(() =>
        this.playButton.attribute("src", "./assets/UI/play_button_hovered.png")
      );
      this.playButton.mouseOut(() =>
        this.playButton.attribute("src", "./assets/UI/play_button.png")
      );
      this.playButton.mousePressed(() =>
        this.playButton.attribute("src", "./assets/UI/play_button_pressed.png")
      );
      this.playButton.mouseClicked(newGame);
    } else {
      this.playButton.show();
    }
  }

  hidePlayButton() {
    this.playButton.hide();
  }
}
