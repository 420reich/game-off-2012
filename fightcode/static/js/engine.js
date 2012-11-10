var ANG_INCREMENT, Arena, BulletStatus, ElementStatus, Engine, MOVE_INCREMENT, RobotActions, RobotStatus, Vector2, WallStatus,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

MOVE_INCREMENT = 1;

ANG_INCREMENT = 1;

Vector2 = (function() {

  function Vector2(x, y) {
    this.x = x;
    this.y = y;
    if (this.x instanceof Vector2) {
      this.y = this.x.y;
      this.x = this.x.x;
    }
  }

  Vector2.prototype.rotate = function(angle, reference) {
    var newX, newY;
    newX = reference.x + ((this.x - reference.x) * Math.cos(angle)) - ((this.y - reference.y) * Math.sin(angle));
    newY = reference.y + ((this.y - reference.y) * Math.cos(angle)) - ((this.x - reference.x) * Math.cos(angle));
    return this;
  };

  Vector2.add = function(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  };

  Vector2.subtract = function(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  };

  return Vector2;

})();

RobotActions = (function() {

  function RobotActions() {
    this.queue = [];
  }

  RobotActions.prototype.move = function(amount, direction) {
    var _i, _ref;
    for (_i = 1, _ref = amount / MOVE_INCREMENT; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
      this.queue.push({
        action: "move",
        direction: direction
      });
    }
    return true;
  };

  RobotActions.prototype.ahead = function(amount) {
    return this.move(amount, 1);
  };

  RobotActions.prototype.back = function(amount) {
    return this.move(amount, -1);
  };

  RobotActions.prototype.rotateCannon = function(degrees) {
    var _i, _ref, _results;
    _results = [];
    for (_i = 1, _ref = degrees / ANG_INCREMENT; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
      _results.push(this.queue.push({
        action: "rotateCannon",
        direction: degrees
      }));
    }
    return _results;
  };

  RobotActions.prototype.turn = function(degrees) {
    var _i, _ref, _results;
    _results = [];
    for (_i = 1, _ref = degrees / ANG_INCREMENT; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
      _results.push(this.queue.push({
        action: "turn",
        direction: degrees
      }));
    }
    return _results;
  };

  RobotActions.prototype.fire = function(bullets) {
    return this.queue.push({
      action: "fire"
    });
  };

  return RobotActions;

})();

Arena = (function() {

  function Arena() {
    this.width = 800;
    this.height = 600;
    this.walls = [new WallStatus(this.width / 2, 0, this.width, 1), new WallStatus(this.width, this.height / 2, 1, this.height), new WallStatus(this.width / 2, this.height, this.width, 1), new WallStatus(0, this.height / 2, 1, this.height)];
  }

  return Arena;

})();

ElementStatus = (function() {

  ElementStatus.id = 1;

  function ElementStatus() {
    this.id = 'element' + (RobotStatus.id++);
    this.angle = 0;
    this.position = new Vector2();
    this.dimension = {
      width: 1,
      height: 1
    };
  }

  ElementStatus.prototype.top = function() {
    return this.position.y - (this.dimension.height / 2);
  };

  ElementStatus.prototype.left = function() {
    return this.position.x - (this.dimension.width / 2);
  };

  ElementStatus.prototype.right = function() {
    return this.position.x + (this.dimension.width / 2);
  };

  ElementStatus.prototype.bottom = function() {
    return this.position.y + (this.dimension.height / 2);
  };

  ElementStatus.prototype.isAlive = function() {
    return true;
  };

  ElementStatus.prototype.upperRightCorner = function() {
    return new Vector2(this.right(), this.top()).rotate(this.angle, this.position);
  };

  ElementStatus.prototype.upperLeftCorner = function() {
    return new Vector2(this.left(), this.top()).rotate(this.angle, this.position);
  };

  ElementStatus.prototype.lowerLeftCorner = function() {
    return new Vector2(this.left(), this.bottom()).rotate(this.angle, this.position);
  };

  ElementStatus.prototype.lowerRightCorner = function() {
    return new Vector2(this.right(), this.bottom()).rotate(this.angle, this.position);
  };

  ElementStatus.prototype.intersects = function(other) {
    var axis, axisList, _i, _len;
    axisList = [Vector2.subtract(this.upperRightCorner(), this.upperLeftCorner()), Vector2.subtract(this.upperRightCorner(), this.lowerRightCorner()), Vector2.subtract(other.upperRightCorner(), other.upperLeftCorner()), Vector2.subtract(other.upperRightCorner(), other.lowerRightCorner())];
    for (_i = 0, _len = axisList.length; _i < _len; _i++) {
      axis = axisList[_i];
      if (!this.isAxisCollision(other, axis)) {
        return false;
      }
    }
    return true;
  };

  ElementStatus.prototype.isAxisCollision = function(other, axis) {
    var maxMine, maxOther, minMine, minOther, myProjections, otherProjections;
    myProjections = [this.generateScalar(this.upperLeftCorner(), axis), this.generateScalar(this.upperRightCorner(), axis), this.generateScalar(this.lowerLeftCorner(), axis), this.generateScalar(this.lowerRightCorner(), axis)];
    otherProjections = [this.generateScalar(other.upperLeftCorner(), axis), this.generateScalar(other.upperRightCorner(), axis), this.generateScalar(other.lowerLeftCorner(), axis), this.generateScalar(other.lowerRightCorner(), axis)];
    minMine = Math.min.apply(Math, myProjections);
    maxMine = Math.max.apply(Math, myProjections);
    minOther = Math.min.apply(Math, otherProjections);
    maxOther = Math.max.apply(Math, otherProjections);
    if (minMine <= maxOther && maxMine >= maxOther) {
      return true;
    } else if (minOther <= maxMine && maxOther >= maxMine) {
      return true;
    }
    return false;
  };

  ElementStatus.prototype.generateScalar = function(corner, axis) {
    var denominator, divisionResult, numerator, projected;
    numerator = (corner.x * axis.x) + (corner.y * axis.y);
    denominator = (axis.x * axis.x) + (axis.y * axis.y);
    divisionResult = numerator / denominator;
    projected = new Vector2(divisionResult * axis.x, divisionResult * axis.y);
    return (axis.x * projected.x) + (axis.y * projected.y);
  };

  return ElementStatus;

})();

WallStatus = (function(_super) {

  __extends(WallStatus, _super);

  function WallStatus(x, y, width, height) {
    WallStatus.__super__.constructor.call(this);
    this.position.x = x;
    this.position.y = y;
    this.dimension.width = width;
    this.dimension.height = height;
  }

  return WallStatus;

})(ElementStatus);

BulletStatus = (function(_super) {

  __extends(BulletStatus, _super);

  function BulletStatus(robotStatus) {
    var xInc, yInc;
    this.robotStatus = robotStatus;
    BulletStatus.__super__.constructor.call(this);
    this.angle = (this.robotStatus.angle + this.robotStatus.cannonAngle) % 360;
    this.angleRad = (this.angle * Math.PI) / 180;
    xInc = Math.cos(this.angleRad) * (this.robotStatus.dimension.width / 2);
    yInc = Math.sin(this.angleRad) * (this.robotStatus.dimension.height / 2);
    this.position.x = this.robotStatus.position.x + xInc;
    this.position.y = this.robotStatus.position.y + yInc;
    this.speed = 5;
    this.strength = 1;
    this.running = true;
  }

  BulletStatus.prototype.isIdle = function() {
    return false;
  };

  BulletStatus.prototype.isAlive = function() {
    return this.running;
  };

  BulletStatus.prototype.runItem = function() {
    this.position.x += Math.cos(this.angleRad) * this.speed;
    return this.position.y += Math.sin(this.angleRad) * this.speed;
  };

  BulletStatus.prototype.destroy = function() {
    return this.running = false;
  };

  return BulletStatus;

})(ElementStatus);

RobotStatus = (function(_super) {

  __extends(RobotStatus, _super);

  function RobotStatus(robot, arena) {
    this.robot = robot;
    this.arena = arena;
    RobotStatus.__super__.constructor.call(this);
    this.life = 100;
    this.cannonAngle = 0;
    this.dimension = {
      width: 27,
      height: 24
    };
    this.queue = [];
  }

  RobotStatus.prototype.isAlive = function() {
    return this.life > 0;
  };

  RobotStatus.prototype.isIdle = function() {
    return this.queue.length === 0;
  };

  RobotStatus.prototype.takeHit = function(buletStatus) {
    this.life -= buletStatus.strength;
    return buletStatus.destroy();
  };

  RobotStatus.prototype.rollbackAfterCollision = function() {
    if (this.previousPosition) {
      this.position = this.previousPosition;
    }
    if (this.previousAngle) {
      return this.angle = this.previousAngle;
    }
  };

  RobotStatus.prototype.runItem = function() {
    var direction, item, rad;
    item = this.queue.shift();
    direction = 1;
    if (item.direction && item.direction < 0) {
      direction = -1;
    }
    this.previousPosition = null;
    this.previousAngle = null;
    switch (item.action) {
      case 'move':
        rad = (this.angle * Math.PI) / 180;
        this.previousPosition = new Vector2(this.position);
        this.position.x += Math.cos(rad) * MOVE_INCREMENT * direction;
        this.position.y += Math.sin(rad) * MOVE_INCREMENT * direction;
        break;
      case 'rotateCannon':
        this.cannonAngle += ANG_INCREMENT * direction;
        this.cannonAngle = this.cannonAngle % 360;
        break;
      case 'turn':
        this.previousAngle = this.angle;
        this.angle += ANG_INCREMENT * direction;
        this.angle = this.angle % 360;
        break;
      case 'fire':
        return new BulletStatus(this);
    }
    return null;
  };

  RobotStatus.prototype.updateQueue = function(actions) {
    return this.queue = actions.queue.concat(this.queue);
  };

  return RobotStatus;

})(ElementStatus);

Engine = (function() {

  function Engine() {
    var robot, robots;
    robots = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.robots = robots;
    this.round = 0;
    this.arena = new Arena();
    this.robotsStatus = (function() {
      var _i, _len, _ref, _results;
      _ref = this.robots;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        robot = _ref[_i];
        _results.push(new RobotStatus(robot, this.arena));
      }
      return _results;
    }).call(this);
  }

  Engine.prototype.isDraw = function() {
    return this.round > 20000;
  };

  Engine.prototype.safeCall = function() {
    var method, obj, params;
    obj = arguments[0], method = arguments[1], params = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (!obj[method]) {
      return;
    }
    return obj[method].apply(obj, params);
  };

  Engine.prototype.checkCollision = function(robotStatus) {
    var actions, eventName, status, wall, _i, _j, _len, _len1, _ref, _ref1;
    actions = new RobotActions();
    _ref = this.arena.walls;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      wall = _ref[_i];
      if (robotStatus.intersects(wall)) {
        robotStatus.rollbackAfterCollision();
        this.safeCall(robotStatus.robot, 'onWallCollision', actions);
      }
    }
    _ref1 = this.robotsStatus;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      status = _ref1[_j];
      if (status === robotStatus || !status.isAlive()) {
        continue;
      }
      if (robotStatus.intersects(status)) {
        eventName = 'onRobotCollision';
        if (status instanceof BulletStatus) {
          eventName = 'onHitByBullet';
          robotStatus.takeHit(status);
        } else {
          robotStatus.rollbackAfterCollision();
        }
        this.safeCall(robotStatus.robot, eventName, actions);
      }
    }
    return actions;
  };

  Engine.prototype.checkSight = function(robotStatus) {
    var actions;
    return actions = new RobotActions();
  };

  Engine.prototype.fight = function() {
    var actions, aliveRobots, fightLog, newStatus, roundLog, status, _i, _len, _ref;
    aliveRobots = this.robotsStatus.length;
    fightLog = [];
    while (aliveRobots > 1 && !this.isDraw()) {
      this.round++;
      fightLog.push(roundLog = {
        round: this.round,
        objects: [],
        events: []
      });
      aliveRobots = 0;
      _ref = this.robotsStatus;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        status = _ref[_i];
        if (!status.isAlive()) {
          continue;
        }
        roundLog.objects.push({
          type: status instanceof RobotStatus ? 'tank' : 'bullet',
          id: status.id,
          position: {
            x: status.position.x,
            y: status.position.y
          },
          dimension: {
            width: status.dimension.width,
            height: status.dimension.height
          },
          health: status.health,
          angle: status.angle,
          cannonAngle: status.cannonAngle
        });
        if (status.isIdle()) {
          actions = new RobotActions();
          this.safeCall(status.robot, 'onIdle', {
            robot: actions
          });
          status.updateQueue(actions);
        }
        newStatus = status.runItem();
        if (newStatus) {
          this.robotsStatus.push(newStatus);
        }
        if (status instanceof RobotStatus) {
          aliveRobots++;
          actions = this.checkCollision(status);
          status.updateQueue(actions);
          actions = this.checkSight(status);
          status.updateQueue(actions);
        }
      }
    }
    if (this.isDraw()) {
      if (this.isDraw()) {
        console.log("DRAW!");
      }
    }
    return fightLog;
  };

  return Engine;

})();
