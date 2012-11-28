var FightArena, arena, container;

container = $(".fight-arena");

FightArena = (function() {

  function FightArena(container) {
    this.container = container;
    this.defaultCode = "var Robot = function(){\n};\nRobot.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n   \n   robot.rotateCannon(180);\n   robot.ahead(100);\n   robot.turn(45);\n};\nRobot.prototype.onScannedRobot = function(ev) {\n   var robot = ev.robot,\n       scannedRobot = ev.scannedRobot;\n\n   if (robot.id == scannedRobot.parentId || robot.parentId == scannedRobot.id) {\n       return;\n   }\n   robot.fire();\n};\nRobot.prototype.onHitByBullet = function(ev) {\n   var robot = ev.robot;\n   \n   if (robot.availableClones > 0) {\n       robot.clone();\n   }\n};";
    this.rotateCode = "var Robot = function(robot){\n  # robot.turn(-robot.angle)\n  # robot.turnGunRight(360)\n  # robot.ahead(200)\n  # robot.turn(90)\n  # robot.ahead(200)\n  # robot.turn(90)\n  # robot.ahead(200)\n  # robot.turn(90)\n  # robot.ahead(200)\n};\nRobot.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n   # robot.turn(1);\n   # robot.fire();\n   # robot.ahead(1)\n   robot.turnGunRight(360)\n};\nRobot.prototype.onWallCollision = function(ev) {\n};\nRobot.prototype.onScannedRobot = function(ev) {\n  ev.robot.fire()\n};\nRobot.prototype.onHitByBullet = function(ev) {\n};";
    this.wallCode = "var Robot = function(robot) {\n  this.moveAmount = Math.max(robot.arenaWidth, robot.arenaHeight);\n\n  robot.turnLeft(robot.angle % 90);\n  robot.turnGunRight(90);\n};\nRobot.prototype.onIdle = function(ev) {\n  var robot = ev.robot;\n  # robot.back(1);\n};\nRobot.prototype.onWallCollision = function(ev) {\n  var robot = ev.robot;\n  robot.turnRight(90);\n};\nRobot.prototype.onHitByBullet = function(ev) {\n  global.log(ev.bearing)\n};\nRobot.prototype.onRobotCollision = function(ev) {\n  var robot = ev.robot;\n  global.log(ev.bearing)\n  if (ev.bearing > -90 && ev.bearing < 90) {\n    robot.back(100);\n  } else {\n    robot.ahead(100);\n  }\n};\nRobot.prototype.onScannedRobot = function(ev) {\n   var robot = ev.robot;\n   robot.fire();\n};";
    this.startWorker();
  }

  FightArena.prototype.startWorker = function() {
    var eventData, worker;
    worker = new Worker('/output/fightcode.worker.min.js');
    worker.onmessage = this.receiveWorkerEvent;
    eventData = {
      robots: 2,
      robot1: {
        name: "robot1",
        code: this.rotateCode,
        rectangle: {
          position: {
            x: 280,
            y: 200
          },
          angle: 0
        }
      },
      robot2: {
        name: "robot2",
        code: this.wallCode,
        rectangle: {
          position: {
            x: 250,
            y: 250
          },
          angle: -90
        }
      }
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
          msPerRound: 5,
          onEndGame: function(result) {
            return console.log(result.winner.robot.name);
          }
        });
        return game.initialize();
      }, 700);
    }
  };

  return FightArena;

})();

if (container.length > 0) {
  arena = new FightArena(container);
}
