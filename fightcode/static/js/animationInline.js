var board, game, i, numberOfRounds, round, rounds, _i;

numberOfRounds = 1000;

rounds = [];

for (i = _i = 1; 1 <= numberOfRounds ? _i <= numberOfRounds : _i >= numberOfRounds; i = 1 <= numberOfRounds ? ++_i : --_i) {
  round = {
    round: i,
    objects: [
      {
        type: 'tank',
        id: 'tank001',
        position: {
          x: 10 + (i / 3),
          y: 100 + (i / 6)
        },
        health: 100 - (i / 20),
        angle: i / 10,
        cannonAngle: i / 8
      }
    ],
    events: []
  };
  if (i === 1) {
    round.events.push({
      type: 'moving',
      id: 'tank001'
    });
  }
  if (i === (numberOfRounds / 2)) {
    round.events.push({
      type: 'backwards',
      id: 'tank001'
    });
  }
  if (i === numberOfRounds) {
    round.events.push({
      type: 'stopped',
      id: 'tank001'
    });
  }
  rounds.push(round);
}

board = $('.board');

game = new Game(board, rounds, {
  msPerRound: 3
});

game.initialize();
