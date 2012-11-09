var board, engine, game, robotA, robotB, rounds;

robotA = new SampleRobot("a");

robotB = new SampleRobot("b");

engine = new Engine(robotA, robotB);

engine.robotsStatus[0].position = new Vector2(750, 200);

engine.robotsStatus[1].position = new Vector2(14, 13);

rounds = engine.fight();

board = $('.board');

game = new Game(board, rounds, {
  msPerRound: 3
});

game.initialize();
