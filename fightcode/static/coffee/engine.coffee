class RobotActions
    constructor: (@robot, @status) ->

    move: (amount, forward) ->
        offset = forward ? 1 : -1

        for [1..amount]
            @status.queue.push((robot, status) ->
                status.x += offset
                status.y += offset
            )

    ahead: (amount) ->
        @move(amount, true)

    back: (amount) ->
        @move(amount, false)

    rotateCannon: (degrees) ->
        for [1..degrees]
            @status.queue.push((robot, status) ->
                status.cannonAngle += 1
            )

    turn: (degrees) ->
        for [1..degrees]
            @status.queue.push((robot, status) ->
                status.angle += 1
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
        #@boundFightRound = @fightRound.bind(this)

        @event = new EventEmitter

        @robotStatusA = new RobotStatus(@robotA)
        @robotStatusB = new RobotStatus(@robotB)
        for robot in [@robotA, @robotB]
            robot.init(this)

    isDraw: ->
        return @round > 180

    fight: ->
        @event.emit('fightStarted')

        @event.emit('onIdle', {
            robot: new RobotActions(@robotA, @robotStatusA)
        })
        @event.emit('onIdle', {
            robot: new RobotActions(@robotB, @robotStatusA)
        })

        while @robotStatusA.isAlive() and @robotStatusB.isAlive() and not @isDraw()
            @round++
            #@boundFightRound(@round)

        if @isDraw()
            console.log("DRAW!") if @isDraw()
        else
            console.log("Robot A WON!") if @robotA.isAlive()
            console.log("Robot B WON!") if @robotB.isAlive()
            console.log("DRAW!") if not @robotA.isAlive() and not @robotB.isAlive()

