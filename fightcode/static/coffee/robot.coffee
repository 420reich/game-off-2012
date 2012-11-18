class SampleRobot
    onIdle: (ev) ->
        # console.log('onIdle', ev)
        robot = ev.robot
        # if robot.id == 'element5'
        robot.ahead(100)
        robot.rotateCannon(360)
        robot.back(100)
        robot.rotateCannon(360)


    onRobotCollision: (ev) ->
        console.log('onRobotCollision', ev)

    onWallCollision: (ev) ->
        # console.log('onWallCollision', ev)

    onScannedRobot: (ev) ->
        # console.log('onScannedRobot', ev)
        robot = ev.robot
        robot.fire(1)

    onHitByBullet: (ev) ->
        # console.log('onHitByBullet', ev, ev.bulletBearing)
        robot = ev.robot
        robot.turn(ev.bulletBearing)
