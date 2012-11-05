var Engine;

Engine = (function() {

  function Engine(robotA, robotB) {
    this.robotA = robotA;
    this.robotB = robotB;
    this.round = 0;
    this.boundFightRound = this.fightRound.bind(this);
    this.eventPipeline = [];
  }

  Engine.prototype.nextEvent = function() {
    if (eventPipeline.length > 0) {
      return this.eventPipeline.shift();
    }
    return null;
  };

  Engine.prototype.isDraw = function() {
    return this.round > 180;
  };

  Engine.prototype.fight = function() {
    while (this.robotA.isAlive() && this.robotB.isAlive() && !this.isDraw()) {
      this.round++;
      this.boundFightRound(this.round);
    }
    if (this.isDraw()) {
      if (this.isDraw()) {
        return console.log("DRAW!");
      }
    } else {
      if (this.robotA.isAlive()) {
        console.log("Robot A WON!");
      }
      if (this.robotB.isAlive()) {
        return console.log("Robot B WON!");
      }
    }
  };

  Engine.prototype.fightRound = function(round) {
    var random;
    random = Math.floor(Math.random() * 2) + 1;
    console.log("Round " + this.round + " - " + this.robotA.name + "=" + this.robotA.life, "" + this.robotB.name + "=" + this.robotB.life);
    if (random === 1) {
      this.robotA.takeDamage(1);
    }
    if (random !== 1) {
      return this.robotB.takeDamage(1);
    }
  };

  return Engine;

})();
