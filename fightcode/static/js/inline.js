var engine, result, robotA, robotB;

robotA = new SampleRobot("a");

robotB = new SampleRobot("b");

engine = new Engine(robotA, robotB);

result = engine.fight();
