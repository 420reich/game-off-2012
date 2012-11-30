var FightArena,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FightArena = (function() {

  function FightArena(container, robots, onRound, options) {
    this.container = container;
    this.robots = robots;
    this.onRound = onRound;
    this.options = options;
    this.receiveWorkerEvent = __bind(this.receiveWorkerEvent, this);

    this.options = $.extend({
      maxRounds: 10000,
      onEndGame: function(result) {},
      boardSize: {
        width: 800,
        height: 500
      }
    }, this.options);
    this.terminated = false;
    this.worker = null;
    this.game = null;
    this.startWorker();
  }

  FightArena.prototype.stop = function() {
    this.terminated = true;
    this.worker.terminate();
    return this.game && this.game.forceEnd();
  };

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
      streaming: this.options.streaming,
      maxRounds: this.options.maxRounds,
      boardSize: {
        width: this.options.boardSize.width,
        height: this.options.boardSize.height
      }
    };
    if (this.options.streaming) {
      this.startGame();
    }
    return this.worker.postMessage(eventData);
  };

  FightArena.prototype.startGame = function(data) {
    var board, boardContainer;
    if (this.game) {
      this.game.end();
      return;
    }
    board = this.container.find('.board');
    board.empty();
    boardContainer = $('<div></div>');
    board.append(boardContainer);
    this.game = new Game(boardContainer, data, {
      msPerRound: 5,
      onRound: this.onRound,
      onEndGame: this.options.onEndGame
    });
    return this.game.start();
  };

  FightArena.prototype.receiveWorkerEvent = function(ev) {
    var evData;
    if (this.terminated) {
      return;
    }
    evData = ev.data;
    if (evData.type === 'log') {
      console.log("LOG", evData.message);
    }
    if (evData.type === 'stream') {
      this.game.addRound(evData.roundLog);
    }
    if (evData.type === 'results') {
      return this.startGame(evData);
    }
  };

  return FightArena;

})();
