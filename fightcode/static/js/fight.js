var FightArena;

FightArena = (function() {

  function FightArena(container, robots) {
    this.container = container;
    this.robots = robots;
    this.defaultCode = "var Robot = function(){\n};\nRobot.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n   \n   robot.rotateCannon(180);\n   robot.ahead(100);\n   robot.turn(45);\n};\nRobot.prototype.onScannedRobot = function(ev) {\n   var robot = ev.robot,\n       scannedRobot = ev.scannedRobot;\n\n   if (robot.id == scannedRobot.parentId || robot.parentId == scannedRobot.id) {\n       return;\n   }\n   robot.fire();\n};\nRobot.prototype.onHitByBullet = function(ev) {\n   var robot = ev.robot;\n   \n   if (robot.availableClones > 0) {\n       robot.clone();\n   }\n};";
    this.rotateCode = "var Robot = function(){\n};\nRobot.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n\n   robot.turn(1);\n   robot.fire();\n};\nRobot.prototype.onWallCollision = function(ev) {\n};\nRobot.prototype.onScannedRobot = function(ev) {\n};\nRobot.prototype.onHitByBullet = function(ev) {\n};";
    this.wallCode = "var Robot = function(robot) {\n  robot.turn(90 - (robot.angle % 90));\n  robot.rotateCannon(90);\n};\nRobot.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n   robot.ahead(1);\n};\nRobot.prototype.onWallCollision = function(ev) {\n   var robot = ev.robot;\n   robot.turn(90);\n};\nRobot.prototype.onRobotCollision = function(ev) {\n   var robot = ev.robot;\n   robot.back(100);\n   robot.turn(270);\n   robot.clone();\n};\nRobot.prototype.onScannedRobot = function(ev) {\n   var robot = ev.robot;\n   robot.fire();\n};";
    this.startWorker();
  }

  FightArena.prototype.startWorker = function() {
    var eventData, worker;
    worker = new Worker('/output/fightcode.worker.min.js');
    worker.onmessage = this.receiveWorkerEvent;
    eventData = {
      robots: 2,
      robot1: this.robots[0],
      robot2: this.robots[1]
    };
    return worker.postMessage(eventData);
  };

  FightArena.prototype.receiveWorkerEvent = function(ev) {
    var board, boardContainer, evData, loading;
    evData = ev.data;
    if (evData.type === 'log') {
      console.log("LOG", evData.message);
    }
    if (evData.type === 'results') {
      board = container.find('.board');
      board.empty();
      boardContainer = $('<div></div>');
      board.append(boardContainer);
      loading = container.find('.loading');
      loading.addClass('animate');
      return setTimeout(function() {
        var game;
        loading.detach();
        game = new Game(boardContainer, evData, {
          msPerRound: 1,
          onEndGame: function(result) {
            return console.log(result);
          }
        });
        return game.initialize();
      }, 700);
    }
  };

  return FightArena;

})();
