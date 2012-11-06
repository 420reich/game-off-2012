var SampleRobot;

SampleRobot = (function() {

  function SampleRobot() {}

  SampleRobot.prototype.init = function() {
    var _this = this;
    return this.engine.event.on('onIdle', function(robot) {
      return robot.moveAhead();
    });
  };

  return SampleRobot;

})();
