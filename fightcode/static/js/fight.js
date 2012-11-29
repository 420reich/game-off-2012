var FightArena,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FightArena = (function() {

  function FightArena(container, robots, onRound, options) {
    this.container = container;
    this.robots = robots;
    this.onRound = onRound;
    this.options = options;
    this.receiveWorkerEvent = __bind(this.receiveWorkerEvent, this);

    if (!this.options) {
      this.options = {
        maxRounds: 10000,
        boardSize: {
          width: 800,
          height: 500
        }
      };
    }
    this.startWorker();
  }

  FightArena.prototype.setRobots = function(robots) {
    return this.robots = robots;
  };

  FightArena.prototype.startWorker = function() {
    var eventData;
    if (!this.worker) {
      this.worker = new Worker('/output/fightcode.worker.min.js');
      this.worker.onmessage = this.receiveWorkerEvent;
    }
    eventData = {
      robots: this.robots.length,
      robot1: this.robots[0],
      robot2: this.robots[1],
      maxRounds: this.options.maxRounds,
      boardSize: {
        width: this.options.boardSize.width,
        height: this.options.boardSize.height
      }
    };
    return this.worker.postMessage(eventData);
  };

  FightArena.prototype.receiveWorkerEvent = function(ev) {
    var board, boardContainer, evData, game;
    evData = ev.data;
    if (evData.type === 'log') {
      console.log("LOG", evData.message);
    }
    if (evData.type === 'results') {
      board = this.container.find('.board');
      board.empty();
      boardContainer = $('<div></div>');
      board.append(boardContainer);
      game = new Game(boardContainer, evData, {
        msPerRound: 5
      });
      return game.initialize();
    }
  };

  return FightArena;

})();
