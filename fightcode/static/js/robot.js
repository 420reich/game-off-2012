var SampleRobot;

SampleRobot = (function() {

  function SampleRobot() {}

  SampleRobot.prototype.onIdle = function(ev) {
    var robot;
    robot = ev.robot;
    robot.ahead(100);
    robot.rotateCannon(360);
    robot.back(100);
    return robot.rotateCannon(360);
  };

  SampleRobot.prototype.onRobotCollision = function(ev) {
    return console.log('onRobotCollision', ev);
  };

  SampleRobot.prototype.onWallCollision = function(ev) {};

  SampleRobot.prototype.onScannedRobot = function(ev) {
    var robot;
    robot = ev.robot;
    return robot.fire(1);
  };

  SampleRobot.prototype.onHitByBullet = function(ev) {
    var robot;
    robot = ev.robot;
    return robot.turn(ev.bulletBearing);
  };

  return SampleRobot;

})();
