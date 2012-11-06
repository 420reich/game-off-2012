var SampleRobot;

SampleRobot = (function() {

  function SampleRobot() {}

  SampleRobot.prototype.init = function(engine) {
    var _this = this;
    engine.event.on('onIdle', function(ev) {
      var robot;
      robot = ev.robot;
      robot.ahead(100);
      robot.rotateCannon(360);
      robot.back(100);
      return robot.rotateCannon(360);
    });
    engine.event.on('onScannedRobot', function(ev) {
      var robot;
      robot = ev.robot;
      return robot.fire(1);
    });
    return engine.event.on('onHitByBullet', function(robot, ev) {
      robot = ev.robot;
      return robot.turn(90 - ev.bulletBearing);
    });
  };

  return SampleRobot;

})();
