var SampleRobot;

SampleRobot = (function() {

  function SampleRobot() {}

  SampleRobot.prototype.onIdle = function(ev) {
    var robot;
    robot = ev.robot;
    if (robot.id === 'element5') {
      return robot.ahead(1);
    }
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

  SampleRobot.prototype.onHitByBullet = function(ev) {};

  return SampleRobot;

})();
