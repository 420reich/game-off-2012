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

  SampleRobot.prototype.onWallCollision = function(ev) {
    return console.log('onWallCollision', ev);
  };

  SampleRobot.prototype.onScannedRobot = function(ev) {
    var robot;
    console.log('onScannedRobot', ev);
    robot = ev.robot;
    return robot.fire(1);
  };

  SampleRobot.prototype.onHitByBullet = function(ev) {
    var robot;
    console.log('onHitByBullet', ev);
    robot = ev.robot;
    return robot.turn(90 - ev.bulletBearing);
  };

  return SampleRobot;

})();
