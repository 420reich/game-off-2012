MOVE_INCREMENT = 1
ANG_INCREMENT = 1

class Vector2
    constructor: (@x, @y) ->
        if @x instanceof Vector2
            @y = @x.y
            @x = @x.x

    rotate: (angle, reference) ->
        newX = reference.x + ((@x - reference.x) * Math.cos(angle)) - ((@y - reference.y) * Math.sin(angle))
        newY = reference.y + ((@y - reference.y) * Math.cos(angle)) - ((@x - reference.x) * Math.cos(angle))
        this

    @add: (v1, v2) ->
        new Vector2(v1.x + v2.x, v1.y + v2.y)

    @subtract: (v1, v2) ->
        new Vector2(v1.x - v2.x, v1.y - v2.y)

class RobotActions
    constructor: ->
        @queue = []

    move: (amount, direction) ->
        for [1..(amount / MOVE_INCREMENT)]
            @queue.push(
                action: "move"
                direction: direction
            )
        true

    ahead: (amount) ->
        @move(amount, 1)

    back: (amount) ->
        @move(amount, -1)

    rotateCannon: (degrees) ->
        for [1..(degrees / ANG_INCREMENT)]
            @queue.push(
                action: "rotateCannon"
                direction: degrees
            )

    turn: (degrees) ->
        for [1..(degrees / ANG_INCREMENT)]
            @queue.push(
                action: "turn"
                direction: degrees
            )

    fire: (bullets) ->
        @queue.push(
            action: "fire"
        )

class Arena
    constructor: ->
        @width = 800
        @height = 600
        @walls = [
            new WallStatus(@width / 2, 0, @width, 1),
            new WallStatus(@width, @height / 2, 1, @height),
            new WallStatus(@width / 2, @height, @width, 1),
            new WallStatus(0, @height / 2, 1, @height)
        ]

class ElementStatus
    @id: 1
    
    constructor: ->
        @id = 'element' + (RobotStatus.id++)
        @angle = 0
        @position = new Vector2()
        @dimension = {
            width: 1,
            height: 1
        }

    top: ->
        @position.y - (@dimension.height / 2)
    left: ->
        @position.x - (@dimension.width / 2)
    right: ->
        @position.x + (@dimension.width / 2)
    bottom: ->
        @position.y + (@dimension.height / 2)

    isAlive: ->
        true

    upperRightCorner: ->
        new Vector2(@right(), @top()).rotate(@angle, @position);

    upperLeftCorner: ->
        new Vector2(@left(), @top()).rotate(@angle, @position);

    lowerLeftCorner: ->
        new Vector2(@left(), @bottom()).rotate(@angle, @position);

    lowerRightCorner: ->
        new Vector2(@right(), @bottom()).rotate(@angle, @position);

    intersects: (other) ->
        axisList = [
            Vector2.subtract(@upperRightCorner(), @upperLeftCorner()),
            Vector2.subtract(@upperRightCorner(), @lowerRightCorner()),
            Vector2.subtract(other.upperRightCorner(), other.upperLeftCorner()),
            Vector2.subtract(other.upperRightCorner(), other.lowerRightCorner())
        ]

        for axis in axisList
            if !@isAxisCollision(other, axis)
                return false

        return true

    isAxisCollision: (other, axis) ->
        myProjections = [
            @generateScalar(@upperLeftCorner(), axis),
            @generateScalar(@upperRightCorner(), axis),
            @generateScalar(@lowerLeftCorner(), axis),
            @generateScalar(@lowerRightCorner(), axis)
        ]

        otherProjections = [
            @generateScalar(other.upperLeftCorner(), axis),
            @generateScalar(other.upperRightCorner(), axis),
            @generateScalar(other.lowerLeftCorner(), axis),
            @generateScalar(other.lowerRightCorner(), axis)
        ]

        minMine = Math.min.apply(Math, myProjections)
        maxMine = Math.max.apply(Math, myProjections)

        minOther = Math.min.apply(Math, otherProjections)
        maxOther = Math.max.apply(Math, otherProjections)

        if minMine <= maxOther && maxMine >= maxOther
            return true
        else if minOther <= maxMine && maxOther >= maxMine
            return true

        return false

    generateScalar: (corner, axis) ->
        numerator = (corner.x * axis.x) + (corner.y * axis.y);
        denominator = (axis.x * axis.x) + (axis.y * axis.y);
        divisionResult = numerator / denominator;
        projected = new Vector2(divisionResult * axis.x, divisionResult * axis.y);
        (axis.x * projected.x) + (axis.y * projected.y);

class WallStatus extends ElementStatus
    constructor: (x, y, width, height) ->
        super()
        @position.x = x
        @position.y = y
        @dimension.width = width
        @dimension.height = height

class BulletStatus extends ElementStatus
    constructor: (@robotStatus) ->
        super()
        @angle = (@robotStatus.angle + @robotStatus.cannonAngle) % 360
        @angleRad = (@angle * Math.PI) / 180

        xInc = Math.cos(@angleRad) * (@robotStatus.dimension.width / 2)
        yInc = Math.sin(@angleRad) * (@robotStatus.dimension.height / 2)
        @position.x = @robotStatus.position.x + xInc
        @position.y = @robotStatus.position.y + yInc
        @speed = 5
        @strength = 1
        @running = true
    
    isIdle: ->
        false

    isAlive: ->
        @running

    runItem: ->
        @position.x += Math.cos(@angleRad) * @speed
        @position.y += Math.sin(@angleRad) * @speed

    destroy: ->
        @running = false

class RobotStatus extends ElementStatus
    constructor: (@robot, @arena) ->
        super()
        @life = 100
        @cannonAngle = 0
        @dimension = {
            width: 27,
            height: 24
        }
        @queue = []

    isAlive: ->
        @life > 0

    isIdle: ->
        @queue.length == 0

    takeHit: (buletStatus) ->
        @life -= buletStatus.strength
        buletStatus.destroy()

    rollbackAfterCollision: ->
        @position = @previousPosition if @previousPosition
        @angle = @previousAngle if @previousAngle

    runItem: ->
        item = @queue.shift()

        direction = 1
        if item.direction and item.direction < 0
            direction = -1

        @previousPosition = null
        @previousAngle = null

        switch item.action
            when 'move'
                rad = (@angle * Math.PI) / 180
                @previousPosition = new Vector2(@position)
                @position.x += Math.cos(rad) * MOVE_INCREMENT * direction
                @position.y += Math.sin(rad) * MOVE_INCREMENT * direction

            when 'rotateCannon'
                @cannonAngle += ANG_INCREMENT * direction
                @cannonAngle = @cannonAngle % 360

            when 'turn'
                @previousAngle = @angle
                @angle += ANG_INCREMENT * direction
                @angle = @angle % 360

            when 'fire'
                return new BulletStatus(this)

        null

    updateQueue: (actions) ->
        @queue = actions.queue.concat(@queue)

class Engine
    constructor: (@robots...) ->
        @round = 0 # unit of time

        @arena = new Arena()
        @robotsStatus = (new RobotStatus(robot, @arena) for robot in @robots)

    isDraw: ->
        return @round > 20000

    safeCall: (obj, method, params...) ->
        if !obj[method]
            return
        obj[method].apply(obj, params)

    checkCollision: (robotStatus) ->
        actions = new RobotActions()

        for wall in @arena.walls
            if robotStatus.intersects(wall)
                robotStatus.rollbackAfterCollision()
                @safeCall(robotStatus.robot, 'onWallCollision', actions)

        for status in @robotsStatus
            continue if status == robotStatus or !status.isAlive()

            if robotStatus.intersects(status)
                eventName = 'onRobotCollision'
                if status instanceof BulletStatus
                    eventName = 'onHitByBullet'
                    robotStatus.takeHit(status)
                else
                    robotStatus.rollbackAfterCollision()

                @safeCall(robotStatus.robot, eventName, actions)

        actions

    checkSight: (robotStatus) ->
        actions = new RobotActions()
        # for status in @robotsStatus


    fight: ->
        aliveRobots = @robotsStatus.length

        fightLog = []

        while aliveRobots > 1 and not @isDraw()
            @round++

            fightLog.push(roundLog = {
                round: @round,
                objects: [],
                events: []
            })

            aliveRobots = 0
            for status in @robotsStatus
                continue if !status.isAlive()

                roundLog.objects.push({
                    type: if status instanceof RobotStatus then 'tank' else 'bullet'
                    id: status.id,
                    position:
                        x: status.position.x
                        y: status.position.y
                    dimension:
                        width: status.dimension.width
                        height: status.dimension.height
                    health:
                        status.health
                    angle:
                        status.angle
                    cannonAngle:
                        status.cannonAngle
                })

                if status.isIdle()
                    actions = new RobotActions()
                    @safeCall(status.robot, 'onIdle', {robot: actions})
                    status.updateQueue(actions)

                newStatus = status.runItem()
                @robotsStatus.push(newStatus) if newStatus

                if status instanceof RobotStatus
                    aliveRobots++
                    actions = @checkCollision(status)
                    status.updateQueue(actions)
                    actions = @checkSight(status)
                    status.updateQueue(actions)

        if @isDraw()
            console.log("DRAW!") if @isDraw()

        fightLog
