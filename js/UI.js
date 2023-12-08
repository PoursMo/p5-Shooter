UI = {
  update: function () {
    this.show();
  },
  show: function () {
    this.showExperience();
    this.showHealth();
    this.showLevel();
    this.showTime();
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
    text("♥".repeat(player.health), width / 2, 20);
    pop();
  },
  showLevel: function () {
    push();
    textFont(pixelFont);
    noStroke();
    fill(200);
    textSize(15);
    text("level : " + player.level, width - 70, 27);
    pop();
  },
  showExperience: function () {
    push();
    stroke(255, 0, 0);
    fill(0, 255, 0);
    stroke(0);
    rect(0, 0, (player.experience * width) / 10, 10);
    pop();
  },
};
