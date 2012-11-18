var Fight, fight,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

Fight = (function() {

  function Fight() {
    this.log = __bind(this.log, this);
    this.bindEvents();
  }

  Fight.prototype.log = function(message) {
    return self.postMessage({
      type: "log",
      message: message
    });
  };

  Fight.prototype.bindEvents = function() {
    var _this = this;
    return self.onmessage = function(event) {
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
    var constr, engine, result, robot, robotCode, robotInstance, robotInstances, robotStatus, _i, _j, _len, _len1, _ref;
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
    })(Engine, [800, 600, 20000].concat(__slice.call(robotInstances)), function(){});
    _ref = engine.robotsStatus;
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      robotStatus = _ref[_j];
      robotStatus.rectangle.position = new Vector2(Math.random(800), Math.random(600));
    }
    result = engine.fight();
    return self.postMessage({
      type: "results",
      result: result
    });
  };

  return Fight;

})();

fight = new Fight();
