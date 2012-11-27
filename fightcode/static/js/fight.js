var FightArena, arena, container;

container = $(".fight-arena");

FightArena = (function() {

  function FightArena(container) {
    this.container = container;
    this.defaultCode = "            window.robotClass = function(){            };            window.robotClass.prototype.onIdle = function(ev) {               var robot = ev.robot;                              robot.rotateCannon(180);               robot.ahead(100);               robot.turn(45);            };            window.robotClass.prototype.onScannedRobot = function(ev) {               var robot = ev.robot,                   scannedRobot = ev.scannedRobot;               if (robot.id == scannedRobot.parentId || robot.parentId == scannedRobot.id) {                   return;               }               robot.fire();            };            window.robotClass.prototype.onHitByBullet = function(ev) {               var robot = ev.robot;                              if (robot.availableClones > 0) {                   robot.clone();               }            };";
    this.rotateCode = "            window.robotClass = function(){            };            window.robotClass.prototype.onIdle = function(ev) {               var robot = ev.robot;               robot.turn(1);               robot.fire();            };            window.robotClass.prototype.onWallCollision = function(ev) {            };            window.robotClass.prototype.onScannedRobot = function(ev) {            };            window.robotClass.prototype.onHitByBullet = function(ev) {            };";
    this.wallCode = "            window.rotated = {};            window.robotClass = function(){            };            window.robotClass.prototype.onIdle = function(ev) {               var robot = ev.robot;               robot.ahead(1);               if (!window.rotated[robot.id]) {                   robot.rotateCannon(90);                   window.rotated[robot.id] = true;               }            };            window.robotClass.prototype.onWallCollision = function(ev) {               var robot = ev.robot;               robot.turn(90);            };            window.robotClass.prototype.onRobotCollision = function(ev) {               var robot = ev.robot;               robot.back(100);               robot.turn(270);               robot.clone();            };            window.robotClass.prototype.onScannedRobot = function(ev) {               var robot = ev.robot;               robot.fire();            };";
    this.startWorker();
  }

  FightArena.prototype.startWorker = function() {
    var eventData, worker;
    worker = new Worker('/output/fightcode.worker.min.js');
    worker.onmessage = this.receiveWorkerEvent;
    eventData = {
      robots: 3,
      robot1: {
        name: "robot1",
        code: this.rotateCode
      },
      robot2: {
        name: "robot2",
        code: this.wallCode
      },
      robot3: {
        name: "robot3",
        code: this.defaultCode
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
