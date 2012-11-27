var FightArena, arena, container;

container = $(".fight-arena");

FightArena = (function() {

  function FightArena(container) {
    this.container = container;
    this.defaultCode = "window.robotClass = function(){\n};\nwindow.robotClass.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n   \n   robot.rotateCannon(180);\n   robot.ahead(100);\n   robot.turn(45);\n};\nwindow.robotClass.prototype.onScannedRobot = function(ev) {\n   var robot = ev.robot,\n       scannedRobot = ev.scannedRobot;\n\n   if (robot.id == scannedRobot.parentId || robot.parentId == scannedRobot.id) {\n       return;\n   }\n   robot.fire();\n};\nwindow.robotClass.prototype.onHitByBullet = function(ev) {\n   var robot = ev.robot;\n   \n   if (robot.availableClones > 0) {\n       robot.clone();\n   }\n};";
    this.rotateCode = "window.robotClass = function(){\n};\nwindow.robotClass.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n\n   robot.turn(1);\n   robot.fire();\n};\nwindow.robotClass.prototype.onWallCollision = function(ev) {\n};\nwindow.robotClass.prototype.onScannedRobot = function(ev) {\n};\nwindow.robotClass.prototype.onHitByBullet = function(ev) {\n};";
    this.wallCode = "window.rotated = {};\nwindow.robotClass = function(){\n};\nwindow.robotClass.prototype.onIdle = function(ev) {\n   var robot = ev.robot;\n   robot.ahead(1);\n   if (!window.rotated[robot.id]) {\n       robot.rotateCannon(90);\n       window.rotated[robot.id] = true;\n   }\n};\nwindow.robotClass.prototype.onWallCollision = function(ev) {\n   var robot = ev.robot;\n   robot.turn(90);\n\n};\nwindow.robotClass.prototype.onRobotCollision = function(ev) {\n   var robot = ev.robot;\n   robot.back(100);\n   robot.turn(270);\n   robot.clone();\n};\nwindow.robotClass.prototype.onScannedRobot = function(ev) {\n   var robot = ev.robot;\n   robot.fire();\n};";
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
        code: this.rotateCode
      },
      robot2: {
        name: "robot2",
        code: this.wallCode
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
