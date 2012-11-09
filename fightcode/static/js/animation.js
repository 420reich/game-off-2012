var Game,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

(function() {
  var targetTime, vendor, w, _i, _len, _ref;
  w = window;
  _ref = ['ms', 'moz', 'webkit', 'o'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    vendor = _ref[_i];
    if (w.requestAnimationFrame) {
      break;
    }
    w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
    w.cancelAnimationFrame = w["" + vendor + "CancelAnimationFrame"] || w["" + vendor + "CancelRequestAnimationFrame"];
  }
  targetTime = 0;
  w.requestAnimationFrame || (w.requestAnimationFrame = function(callback) {
    var currentTime;
    targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
    return w.setTimeout((function() {
      return callback(+(new Date));
    }), targetTime - currentTime);
  });
  return w.cancelAnimationFrame || (w.cancelAnimationFrame = function(id) {
    return clearTimeout(id);
  });
})();

Game = (function() {

  function Game(board, events, options) {
    this.board = board;
    this.events = events;
    this.options = options;
    this.play = __bind(this.play, this);

    this.handleTank = __bind(this.handleTank, this);

    this.createTank = __bind(this.createTank, this);

    this.objects = {};
    this.options = $.extend({
      msPerRound: 100
    }, this.options);
  }

  Game.prototype.initialize = function() {
    this.lastRound = window.mozAnimationStartTime || Date.now();
    return requestAnimationFrame(this.play);
  };

  Game.prototype.createTank = function(object) {
    var tank, tankObject;
    tank = $('<div class="tank"><div class="body"></div><div class="cannon"></div><div class="life"></div></div>');
    tankObject = {
      tank: tank,
      body: tank.find('.body'),
      cannon: tank.find('.cannon'),
      life: tank.find('.life')
    };
    this.board.append(tank);
    this.objects[object.id] = tankObject;
    return tankObject;
  };

  Game.prototype.handleTank = function(object) {
    var tank;
    if (!this.objects[object.id]) {
      tank = this.createTank(object);
    } else {
      tank = this.objects[object.id];
    }
    tank.tank.css('top', object.position.y);
    tank.tank.css('left', object.position.x);
    tank.body.css('transform', "rotate(" + object.angle + "deg)");
    tank.cannon.css('transform', "rotate(" + (object.angle + object.cannonAngle) + "deg)");
    return tank.life.css('width', 30 * object.health / 100);
  };

  Game.prototype.play = function(timestamp) {
    var event, object, progress, round, roundNumber, rounds, _i, _j, _k, _len, _len1, _ref, _ref1;
    progress = timestamp - this.lastRound;
    rounds = progress / this.options.msPerRound;
    this.lastRound = window.mozAnimationStartTime || Date.now();
    for (roundNumber = _i = 0; 0 <= rounds ? _i <= rounds : _i >= rounds; roundNumber = 0 <= rounds ? ++_i : --_i) {
      if (this.events.length === 0) {
        break;
      }
      round = this.events.shift();
      _ref = round.objects;
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        object = _ref[_j];
        switch (object.type) {
          case 'tank':
            this.handleTank(object);
        }
      }
      _ref1 = round.events;
      for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
        event = _ref1[_k];
        switch (event.type) {
          case 'moving':
            this.objects[event.id].tank.addClass('moving');
            break;
          case 'backwards':
            this.objects[event.id].tank.addClass('backwards');
            break;
          case 'stopped':
            this.objects[event.id].tank.removeClass('backwards').removeClass('moving');
        }
      }
    }
    if (this.events.length > 0) {
      return requestAnimationFrame(this.play);
    }
  };

  return Game;

})();
