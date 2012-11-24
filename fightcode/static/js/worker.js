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
    var boardSize, constr, engine, eventData, maxRounds, result, robot, robotCode, robotInstance, robotInstances, _i, _len,
      _this = this;
    maxRounds = 5000;
    boardSize = {
      width: 800,
      height: 500
    };
    robotInstances = [];
    for (_i = 0, _len = robots.length; _i < _len; _i++) {
      robot = robots[_i];
      robotCode = "(function() {" + robot + "}.bind(window)()); return window.robotClass;";
      constr = new Function("window", robotCode)({
        log: function(message) {
          return _this.log(message);
        }
      });
      robotInstance = new constr();
      robotInstances.push(robotInstance);
    }
    engine = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args), t = typeof result;
      return t == "object" || t == "function" ? result || child : child;
    })(Engine, [boardSize.width, boardSize.height, maxRounds].concat(__slice.call(robotInstances)), function(){});
    engine.robotsStatus[0].rectangle.setPosition(50, 50);
    engine.robotsStatus[1].rectangle.setPosition(50, 200);
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
