var Engine, RobotActions, RobotStatus;

RobotActions = (function() {

  function RobotActions(robot, status) {
    this.robot = robot;
    this.status = status;
  }

  RobotActions.prototype.move = function(amount, forward) {
    var offset, _i, _results;
    offset = forward ? 1 : -1;
    _results = [];
    for (_i = 1; 1 <= amount ? _i <= amount : _i >= amount; 1 <= amount ? _i++ : _i--) {
      _results.push(this.status.queue.push(function(robot, status) {
        status.x += offset;
        return status.y += offset;
      }));
    }
    return _results;
  };

  RobotActions.prototype.ahead = function(amount) {
    return this.move(amount, true);
  };

  RobotActions.prototype.back = function(amount) {
    return this.move(amount, false);
  };

  RobotActions.prototype.rotateCannon = function(degrees) {
    var _i, _results;
    _results = [];
    for (_i = 1; 1 <= degrees ? _i <= degrees : _i >= degrees; 1 <= degrees ? _i++ : _i--) {
      _results.push(this.status.queue.push(function(robot, status) {
        return status.cannonAngle += 1;
      }));
    }
    return _results;
  };

  RobotActions.prototype.turn = function(degrees) {
    var _i, _results;
    _results = [];
    for (_i = 1; 1 <= degrees ? _i <= degrees : _i >= degrees; 1 <= degrees ? _i++ : _i--) {
      _results.push(this.status.queue.push(function(robot, status) {
        return status.angle += 1;
      }));
    }
    return _results;
  };

  RobotActions.prototype.fire = function(bullets) {};

  return RobotActions;

})();

RobotStatus = (function() {

  function RobotStatus(robot) {
    this.robot = robot;
    this.life = 100;
    this.angle = 0;
    this.cannonAngle = 0;
    this.position = {
      x: 0,
      y: 0
    };
    this.queue = [];
  }

  RobotStatus.prototype.isAlive = function() {
    return this.life > 0;
  };

  return RobotStatus;

})();

Engine = (function() {

  function Engine(robotA, robotB) {
    var robot, _i, _len, _ref;
    this.robotA = robotA;
    this.robotB = robotB;
    this.round = 0;
    this.event = new EventEmitter;
    this.robotStatusA = new RobotStatus(this.robotA);
    this.robotStatusB = new RobotStatus(this.robotB);
    _ref = [this.robotA, this.robotB];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      robot = _ref[_i];
      robot.init(this);
    }
  }

  Engine.prototype.isDraw = function() {
    return this.round > 1800;
  };

  Engine.prototype.fight = function() {
    var item, robot, status, _i, _len, _ref;
    this.event.emit('fightStarted');
    this.event.emit('onIdle', {
      robot: new RobotActions(this.robotA, this.robotStatusA)
    });
    this.event.emit('onIdle', {
      robot: new RobotActions(this.robotB, this.robotStatusB)
    });
    while (this.robotStatusA.isAlive() && this.robotStatusB.isAlive() && !this.isDraw()) {
      this.round++;
      console.log("Robot A Queue is " + this.robotStatusA.queue.length + " items.");
      console.log("Robot B Queue is " + this.robotStatusB.queue.length + " items.");
      _ref = [[this.robotA, this.robotStatusA], [this.robotB, this.robotStatusB]];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        robot = item[0];
        status = item[1];
        if (status.queue.length > 0) {
          item = status.queue.shift();
          item(robot, status);
        } else {
          this.event.emit('onIdle', {
            robot: new RobotActions(robot, status)
          });
        }
      }
    }
    if (this.isDraw()) {
      if (this.isDraw()) {
        return console.log("DRAW!");
      }
    } else {
      if (this.robotA.isAlive()) {
        console.log("Robot A WON!");
      }
      if (this.robotB.isAlive()) {
        console.log("Robot B WON!");
      }
      if (!this.robotA.isAlive() && !this.robotB.isAlive()) {
        return console.log("DRAW!");
      }
    }
  };

  return Engine;

})();
