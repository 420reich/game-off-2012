var SampleRobot,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SampleRobot = (function() {

  function SampleRobot() {
    this.onHitByBullet = __bind(this.onHitByBullet, this);

    this.onScannedRobot = __bind(this.onScannedRobot, this);

    this.onIdle = __bind(this.onIdle, this);

  }

  SampleRobot.prototype.onIdle = function(ev) {
    var robot;
    robot = ev.robot;
    robot.ahead(100);
    robot.rotateCannon(360);
    robot.back(100);
    return robot.rotateCannon(360);
  };

  SampleRobot.prototype.onScannedRobot = function(ev) {
    var robot;
    robot = ev.robot;
    return robot.fire(1);
  };

  SampleRobot.prototype.onHitByBullet = function(ev) {
    var robot;
    robot = ev.robot;
    return robot.turn(90 - ev.bulletBearing);
  };

  return SampleRobot;

})();
