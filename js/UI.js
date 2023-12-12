let UI = {
  initialize: function () {
    if (this.multipliersUI === undefined) {
      this.multipliersUI = createP();
      this.multipliersUI.addClass("weaponUI");
    }
  },
  test: function () {
    //BITE
    this.multipliersUI.html(
      "Fire rate: " +
        round(playerStats.fireDelayMultiplier * 100) +
        "%<br>Damage: " +
        round(playerStats.damageMultiplier * 100) +
        "%"
    );
  },
  update: function () {
    this.show();
  },
  show: function () {
    this.showExperience();
    this.showHealth();
    this.showLevel();
    this.showTime();
    if (bossKilled) {
      this.showEndGame();
    }
  },
  showEndGame: function () {
    push();
    fill(255, 75, 75);
    noStroke();
    textFont(pixelFont);
    textSize(40);
    text("YOU WON\n(for now)\nEsc to restart", width / 2, height / 2);
    pop();
  },
  showTime: function () {
    this.minutes = floor((millis() - timeGameStart) / 1000 / 60);
    if (this.minutes < 10) this.minutes = "0" + this.minutes;
    this.seconds = floor(((millis() - timeGameStart) / 1000) % 60);
    if (this.seconds < 10) this.seconds = "0" + this.seconds;
    push();
    fill(200);
    textSize(15);
    textFont(pixelFont);
    text(this.minutes + ":" + this.seconds, width / 2, 40);
    pop();
  },
  showHealth: function () {
    push();
    fill(255, 50, 50);
    noStroke();
    textSize(20);
    text(
      "❤".repeat(playerStats.health) + "♡".repeat(playerStats.maxHealth - playerStats.health),
      width / 2,
      20
    );
    pop();
  },
  showLevel: function () {
    push();
    textFont(pixelFont);
    noStroke();
    fill(200);
    textSize(15);
    text("level : " + playerStats.level, width - 70, 27);
    pop();
  },
  showExperience: function () {
    push();
    stroke(255, 0, 0);
    fill(0, 255, 0);
    stroke(0);
    rect(0, 0, (playerStats.experience * width) / 10, 10);
    pop();
  },
  showPlayButton: function () {
    if (playButton === undefined) {
      let d = createDiv();
      d.addClass("wrapper");
      playButton = createButton("Play");
      playButton.style("font-size", "35px");
      playButton.size(150, 70);
      playButton.parent(d);
      playButton.mouseClicked(newGame);
    } else {
      playButton.show();
    }
  },
};
