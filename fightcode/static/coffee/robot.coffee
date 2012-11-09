class SampleRobot
    onIdle: (ev) ->
        # console.log('onIdle', ev)
        robot = ev.robot
        robot.ahead(100)
        robot.rotateCannon(360)
        robot.back(100)
        robot.rotateCannon(360)

    onRobotCollision: (ev) ->
        console.log('onRobotCollision', ev)

    onWallCollision: (ev) ->
        console.log('onWallCollision', ev)

    onScannedRobot: (ev) ->
        console.log('onScannedRobot', ev)
        robot = ev.robot
        robot.fire(1)

    onHitByBullet: (ev) ->
        console.log('onHitByBullet', ev)
        robot = ev.robot
        robot.turn(90 - ev.bulletBearing)
