var engine, result, robotA, robotB;

robotA = new Robot("a");

robotB = new Robot("b");

engine = new Engine(robotA, robotB);

result = engine.fight();
