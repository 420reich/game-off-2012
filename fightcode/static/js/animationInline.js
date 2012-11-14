var board, engine, game, robotA, robotB, rounds;

robotA = new SampleRobot("a");

robotB = new SampleRobot("b");

engine = new Engine(robotA, robotB);

engine.robotsStatus[0].cannonAngle = 1;

engine.robotsStatus[0].rectangle.position = new Vector2(400, 100);

engine.robotsStatus[1].rectangle.angle = 91;

engine.robotsStatus[1].rectangle.position = new Vector2(500, 15);

rounds = engine.fight();

board = $('.board');

game = new Game(board, rounds, {
  msPerRound: 8
});

game.initialize();
