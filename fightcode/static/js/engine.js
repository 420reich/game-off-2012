var Engine;

Engine = (function() {

  function Engine(robotA, robotB) {
    var robot, _i, _len, _ref;
    this.robotA = robotA;
    this.robotB = robotB;
    this.round = 0;
    this.boundFightRound = this.fightRound.bind(this);
    this.event = new EventEmitter;
    _ref = [this.robotA, this.robotB];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      robot = _ref[_i];
      robot.engine = this;
      robot.bindEvents();
    }
  }

  Engine.prototype.isDraw = function() {
    return this.round > 180;
  };

  Engine.prototype.fire = function(robot) {
    var random;
    random = Math.floor(Math.random() * 10) + 1;
    if (random > 3) {
      return false;
    }
    if (robot === this.robotB) {
      this.robotA.takeDamage(2);
    }
    if (robot === this.robotA) {
      return this.robotB.takeDamage(2);
    }
  };

  Engine.prototype.fight = function() {
    this.event.emit('fightStarted');
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
        console.log("Robot B WON!");
      }
      if (!this.robotA.isAlive() && !this.robotB.isAlive()) {
        return console.log("DRAW!");
      }
    }
  };

  Engine.prototype.fightRound = function(round) {
    this.event.emit('roundStarted', this, round);
    return console.log("Round " + this.round + " - " + this.robotA.name + "=" + this.robotA.life, "" + this.robotB.name + "=" + this.robotB.life);
  };

  return Engine;

})();
