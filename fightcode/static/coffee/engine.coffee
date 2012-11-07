class RobotActions
    constructor: (@robot, @status) ->

    move: (amount, forward) ->
        offset = if forward then 1 else -1

        for [1..amount]
            @status.queue.push(
                action: "move"
                x: offset
                y: offset
            )
        true

    ahead: (amount) ->
        @move(amount, true)

    back: (amount) ->
        @move(amount, false)

    rotateCannon: (degrees) ->
        for [1..degrees]
            @status.queue.push(
                action: "rotateCannon"
                cannonAngle: 1
            )

    turn: (degrees) ->
        for [1..degrees]
            @status.queue.push(
                action: "turn"
                angle: 1
            )

    fire: (bullets) ->

class RobotStatus
    constructor: (@robot) ->
        @life = 100
        @angle = 0
        @cannonAngle = 0
        @position = {
            x: 0
            y: 0
        }
        @queue = []

    isAlive: ->
        return @life > 0

class Engine
    constructor: (@robotA, @robotB) ->
        @round = 0 # unit of time

        @robotStatusA = new RobotStatus(@robotA)
        @robotStatusB = new RobotStatus(@robotB)

    isDraw: ->
        return @round > 1800

    executeAction: (robot, status) ->
        queue = status.queue
        return false if queue.length == 0

        item = queue.shift()

        switch item.action
            when 'move'
                status.x += item.x
                status.y += item.y

            when 'rotateCannon'
                status.cannonAngle += item.cannonAngle

            when 'turn'
                status.angle += item.angle

        true

    fight: ->
        @robotA.onIdle({
            robot: new RobotActions(@robotA, @robotStatusA)
        })

        @robotA.onIdle({
            robot: new RobotActions(@robotB, @robotStatusB)
        })


        while @robotStatusA.isAlive() and @robotStatusB.isAlive() and not @isDraw()
            @round++
            console.log("Robot A Queue is #{ @robotStatusA.queue.length } items.")
            console.log("Robot B Queue is #{ @robotStatusB.queue.length } items.")

            for item in [[@robotA, @robotStatusA], [@robotB, @robotStatusB]]
                robot = item[0]
                status = item[1]

                if not @executeAction(robot, status)
                    robot.onIdle({
                        robot: new RobotActions(robot, status)
                    })

        if @isDraw()
            console.log("DRAW!") if @isDraw()
        else
            console.log("Robot A WON!") if @robotA.isAlive()
            console.log("Robot B WON!") if @robotB.isAlive()
            console.log("DRAW!") if not @robotA.isAlive() and not @robotB.isAlive()

