var board, engine, game, i, numberOfRobots, robot, robots, rounds, _i, _j, _ref, _ref1;

numberOfRobots = 5;

robots = [];

for (i = _i = 0, _ref = numberOfRobots - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
  robot = new SampleRobot(i);
  robots.push(robot);
}

engine = (function(func, args, ctor) {
  ctor.prototype = func.prototype;
  var child = new ctor, result = func.apply(child, args), t = typeof result;
  return t == "object" || t == "function" ? result || child : child;
})(Engine, robots, function(){});

for (i = _j = 0, _ref1 = numberOfRobots - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
  engine.robotsStatus[i].position = new Vector2(Math.random() * 700 + 50, Math.random() * 500 + 50);
}

rounds = engine.fight();

board = $('.board');

game = new Game(board, rounds, {
  msPerRound: 3
});

game.initialize();
