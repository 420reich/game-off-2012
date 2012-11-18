var Fight, fight, worker,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

worker = self;

Fight = (function() {

  function Fight() {
    this.log = __bind(this.log, this);
    this.bindEvents();
  }

  Fight.prototype.log = function(message) {
    return worker.postMessage({
      type: "log",
      message: message
    });
  };

  Fight.prototype.bindEvents = function() {
    var _this = this;
    return worker.onmessage = function(event) {
      var code, evData, i, robots, _i, _ref;
      evData = event.data;
      robots = [];
      for (i = _i = 1, _ref = evData.robots; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        code = evData['robot' + i];
        robots.push(code);
      }
      return _this.processFight(robots);
    };
  };

  Fight.prototype.processFight = function(robots) {
    var boardSize, constr, engine, eventData, maxRounds, result, robot, robotCode, robotInstance, robotInstances, robotStatus, _i, _j, _len, _len1, _ref;
    maxRounds = 10000;
    boardSize = {
      width: 800,
      height: 500
    };
    robotInstances = [];
    for (_i = 0, _len = robots.length; _i < _len; _i++) {
      robot = robots[_i];
      robotCode = "with(window){" + robot + "\nreturn window.robotClass;}";
      constr = new Function("window", robotCode)({});
      robotInstance = new constr();
      robotInstances.push(robotInstance);
    }
    engine = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args), t = typeof result;
      return t == "object" || t == "function" ? result || child : child;
    })(Engine, [boardSize.width, boardSize.height, maxRounds].concat(__slice.call(robotInstances)), function(){});
    _ref = engine.robotsStatus;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      robotStatus = _ref[_j];
      robotStatus.rectangle.position = new Vector2(Math.random() * boardSize.width, Math.random() * boardSize.height);
    }
    result = engine.fight();
    eventData = {
      type: "results",
      result: result.result
    };
    return worker.postMessage(eventData);
  };

  return Fight;

})();

fight = new Fight();
