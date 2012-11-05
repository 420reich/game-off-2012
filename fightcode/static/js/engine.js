var Engine;

Engine = (function() {

  function Engine(round) {
    this.round = round;
  }

  Engine.prototype.fight = function(robotA, robotB) {
    this.robotA = robotA;
    this.robotB = robotB;
    return console.log(this.robotA.name, this.robotB.name);
  };

  return Engine;

})();
