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
      robot.life = 100;
      robot.position = {
        x: 0,
        y: 0
      };
      robot.init();
    }
  }

  Engine.prototype.isAlive = function(robot) {
    return robot.life > 0;
  };

  Engine.prototype.isDraw = function() {
    return this.round > 180;
  };

  Engine.prototype.fire = function() {};

  Engine.prototype.fight = function() {
    var _results;
    this.event.emit('fightStarted');
    _results = [];
    while (this.isAlive(this.robotA) && this.isAlive(this.robotB) && !this.isDraw()) {
      this.round++;
      _results.push(this.boundFightRound(this.round));
    }
    return _results;
  };

  Engine.prototype.fightRound = function(round) {};

  return Engine;

})();
