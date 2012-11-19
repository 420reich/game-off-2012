var FightArena, arena, container;

container = $(".fight-arena");

FightArena = (function() {

  function FightArena(container) {
    this.container = container;
    this.defaultCode = ["//FightCode can only understand your robot", "//if its class is called robotClass", "window.robotClass = function(){", "};", "window.robotClass.prototype.onIdle = function(ev) {", "   var robot = ev.robot;", "   robot.ahead(100);", "   robot.rotateCannon(360);", "   robot.back(100);", "   robot.rotateCannon(360);", "};", "window.robotClass.prototype.onScannedRobot = function(ev) {", "   var robot = ev.robot;", "   robot.fire();", "};"].join('\n');
    this.startWorker();
  }

  FightArena.prototype.startWorker = function() {
    var eventData, worker;
    worker = new Worker('/output/fightcode.worker.min.js');
    worker.onmessage = this.receiveWorkerEvent;
    eventData = {
      robots: 2,
      robot1: this.defaultCode,
      robot2: this.defaultCode
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
        game = new Game(boardContainer, evData.result, {
          msPerRound: 3
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
