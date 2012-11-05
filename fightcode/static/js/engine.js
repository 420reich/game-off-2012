var Engine;

Engine = (function() {

  function Engine(robotA, robotB) {
    this.robotA = robotA;
    this.robotB = robotB;
    this.boundFightRound = this.fightRound.bind(this);
    this.eventPipeline = [];
  }

  Engine.prototype.nextEvent = function() {
    if (eventPipeline.length > 0) {
      return this.eventPipeline.shift();
    }
    return null;
  };

  Engine.prototype.fight = function() {
    return setTimeout(this.boundFightRound, 1000);
  };

  Engine.prototype.fightRound = function() {
    console.log("" + this.robotA.name + "=" + this.robotA.life, "" + this.robotB.name + "=" + this.robotB.life);
    if (this.robotA.isAlive() && this.robotB.isAlive()) {
      return setTimeout(this.boundFightRound, 1000);
    }
  };

  return Engine;

})();
