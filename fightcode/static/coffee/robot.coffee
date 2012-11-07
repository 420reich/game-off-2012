class SampleRobot
    onIdle: (ev) =>
        robot = ev.robot
        robot.ahead(100)
        robot.rotateCannon(360)
        robot.back(100)
        robot.rotateCannon(360)

    onScannedRobot: (ev) =>
        robot = ev.robot
        robot.fire(1)

    onHitByBullet: (ev) =>
        robot = ev.robot
        robot.turn(90 - ev.bulletBearing)
