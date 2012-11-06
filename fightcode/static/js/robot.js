var Robot, SampleRobot,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Robot = (function() {

  function Robot(name) {
    this.name = name;
    this.life = 100;
    this.engine = null;
  }

  Robot.prototype.isAlive = function() {
    return this.life > 0;
  };

  Robot.prototype.takeDamage = function(dmg) {
    return this.life -= dmg;
  };

  Robot.prototype.bindEvents = function() {};

  Robot.prototype.fire = function() {};

  return Robot;

})();

SampleRobot = (function(_super) {

  __extends(SampleRobot, _super);

  function SampleRobot(name) {
    this.name = name;
    SampleRobot.__super__.constructor.call(this, "Sample " + this.name);
  }

  SampleRobot.prototype.bindEvents = function() {
    var self;
    self = this;
    return this.engine.event.on('roundStarted', function(round) {
      return this.fire(self);
    });
  };

  return SampleRobot;

})(Robot);
