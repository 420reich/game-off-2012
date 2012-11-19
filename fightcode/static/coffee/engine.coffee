MOVE_INCREMENT = 1
ANG_INCREMENT = 1
PI2 = Math.PI * 2
RAD2DEG = 180 / Math.PI

class Vector2
    constructor: (@x, @y) ->
        if @x instanceof Vector2
            @y = @x.y
            @x = @x.x

    rotate: (angle, reference) ->
        angle = (angle * Math.PI) / 180
        sin = Math.sin(angle)
        cos = Math.cos(angle)

        translatedX = @x - reference.x
        translatedY = @y - reference.y

        @x = translatedX * cos - translatedY * sin + reference.x
        @y = translatedX * sin + translatedY * cos + reference.y

        this

    module: ->
        Math.sqrt(@x * @x + @y *@y)

    projectTo: (axis) ->
        numerator = (@x * axis.x) + (@y * axis.y)
        denominator = (axis.x * axis.x) + (axis.y * axis.y)
        divisionResult = numerator / denominator
        new Vector2(divisionResult * axis.x, divisionResult * axis.y)

    @add: (v1, v2) ->
        new Vector2(v1.x + v2.x, v1.y + v2.y)

    @subtract: (v1, v2) ->
        new Vector2(v1.x - v2.x, v1.y - v2.y)

class RobotActions
    constructor: (currentStatus) ->
        @id = currentStatus.id
        @angle = currentStatus.rectangle.angle
        @cannonAngle = currentStatus.cannonAngle
        @position = new Vector2(currentStatus.rectangle.position)
        @life = currentStatus.life
        @queue = []

    move: (amount, direction) ->
        return if amount == 0
        @queue.push(
            action: "move"
            direction: direction
            count: Math.abs(amount) / MOVE_INCREMENT
        )
        true

    ahead: (amount) ->
        @move(amount, 1)

    back: (amount) ->
        @move(amount, -1)

    rotateCannon: (degrees) ->
        return if degrees == 0
        @queue.push(
            action: "rotateCannon"
            direction: degrees
            count: Math.abs(degrees) / ANG_INCREMENT
        )

    turn: (degrees) ->
        return if degrees == 0
        @queue.push(
            action: "turn"
            direction: degrees
            count: Math.abs(degrees) / ANG_INCREMENT
        )

    fire: (bullets) ->
        @queue.push(
            action: "fire"
        )

class Arena
    constructor: (@width, @height) ->
        @walls = [
            new WallStatus(@width / 2, 0, @width, 1),
            new WallStatus(@width, @height / 2, 1, @height),
            new WallStatus(@width / 2, @height, @width, 1),
            new WallStatus(0, @height / 2, 1, @height)
        ]

class Rectangle
    constructor: (x = 0, y = 0, width = 1, height = 1, @angle = 0) ->
        @position = new Vector2(x, y)
        @setDimension(width, height)
        @updateCoords()

    setAngle: (@angle) ->
        @updateCoords()

    setDimension: (width, height) ->
        @dimension = {
            width: width,
            height: height
        }
        @halfWidth = width / 2
        @halfHeight = height / 2
        @radius = @halfWidth + @halfHeight
        @updateCoords()

    setPosition: (x, y) ->
        @position.x = x
        @position.y = y
        @updateCoords()

    incPosition: (x, y) ->
        @position.x += x
        @position.y += y
        @updateCoords()

    updateCoords: ->
        top = @position.y - @halfHeight
        left = @position.x - @halfWidth
        bottom = @position.y + @halfHeight
        right = @position.x + @halfWidth

        @upperRight = new Vector2(right, top).rotate(@angle, @position)
        @upperLeft = new Vector2(left, top).rotate(@angle, @position)
        @lowerLeft = new Vector2(left, bottom).rotate(@angle, @position)
        @lowerRight = new Vector2(right, bottom).rotate(@angle, @position)

    intersects: (other, smart = true) ->
        distance = Vector2.subtract(@position, other.position).module()
        if distance > (@radius + other.radius)
            return false

        axisList = [
            Vector2.subtract(@upperRight, @upperLeft),
            Vector2.subtract(@upperRight, @lowerRight),
            Vector2.subtract(other.upperRight, other.upperLeft),
            Vector2.subtract(other.upperRight, other.lowerRight)
        ]

        for axis in axisList
            if !@isAxisCollision(other, axis)
                return false

        return true

    isAxisCollision: (other, axis) ->
        myProjections = [
            @generateScalar(@upperLeft, axis),
            @generateScalar(@upperRight, axis),
            @generateScalar(@lowerLeft, axis),
            @generateScalar(@lowerRight, axis)
        ]

        otherProjections = [
            @generateScalar(other.upperLeft, axis),
            @generateScalar(other.upperRight, axis),
            @generateScalar(other.lowerLeft, axis),
            @generateScalar(other.lowerRight, axis)
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
        projected = corner.projectTo(axis)
        (axis.x * projected.x) + (axis.y * projected.y);

class ElementStatus
    @id: 1

    constructor: ->
        @id = 'element' + (RobotStatus.id++)
        @rectangle = new Rectangle()

    isAlive: ->
        true


class WallStatus extends ElementStatus
    constructor: (x, y, width, height) ->
        super()
        @rectangle.setPosition(x, y)
        @rectangle.setDimension(width, height)

class BulletStatus extends ElementStatus
    constructor: (@robotStatus) ->
        super()
        @rectangle.setAngle((@robotStatus.rectangle.angle + @robotStatus.cannonAngle) % 360)

        angleRad = (@rectangle.angle * Math.PI) / 180
        @sinAngle = Math.sin(angleRad)
        @cosAngle = Math.cos(angleRad)

        xInc = @cosAngle * (@robotStatus.rectangle.dimension.width / 2)
        yInc = @sinAngle * (@robotStatus.rectangle.dimension.height / 2)
        @rectangle.setPosition(@robotStatus.rectangle.position.x + xInc, @robotStatus.rectangle.position.y + yInc)

        @speed = 2
        @strength = 20
        @running = true

    isIdle: ->
        false

    isAlive: ->
        @running

    runItem: ->
        @previousPosition = new Vector2(@rectangle.position)
        @rectangle.incPosition(@cosAngle * @speed, @sinAngle * @speed)

        null

    destroy: ->
        @running = false

    rollbackAfterCollision: ->
        @rectangle.setPosition(@previousPosition.x, @previousPosition.y) if @previousPosition

    updateQueue: ->
        #no-op

class RobotStatus extends ElementStatus
    constructor: (@robot, @arena) ->
        super()
        @life = 100
        @cannonAngle = 0
        @rectangle.setDimension(27, 24)
        @baseScanWaitTime = 50
        @scanWaitTime = 0
        @queue = []

    isAlive: ->
        @life > 0

    isIdle: ->
        @queue.length == 0

    takeHit: (buletStatus) ->
        @life -= buletStatus.strength
        buletStatus.destroy()

    rollbackAfterCollision: ->
        @rectangle.setPosition(@previousPosition.x, @previousPosition.y) if @previousPosition
        @rectangle.setAngle(@previousAngle) if @previousAngle

    cannonTotalAngle: ->
        (@rectangle.angle + @cannonAngle) % 360

    canScan: ->
        @scanWaitTime == 0

    tickScan: ->
        @scanWaitTime -= 1 if @scanWaitTime > 0

    preventScan: ->
        @scanWaitTime = @baseScanWaitTime

    runItem: ->
        item = @queue.shift()
        return unless item

        if 'count' of item
            item.count--
            @queue.unshift(item) if item.count > 0

        direction = 1
        if item.direction and item.direction < 0
            direction = -1

        @previousPosition = null
        @previousAngle = null
        @previousCannonAngle = null

        switch item.action
            when 'move'
                rad = (@rectangle.angle * Math.PI) / 180
                @previousPosition = new Vector2(@rectangle.position)
                @rectangle.incPosition(Math.cos(rad) * MOVE_INCREMENT * direction, Math.sin(rad) * MOVE_INCREMENT * direction)

            when 'rotateCannon'
                @previousCannonAngle = @cannonAngl
                @cannonAngle += ANG_INCREMENT * direction
                @cannonAngle = @cannonAngle % 360

            when 'turn'
                @previousAngle = @rectangle.angle
                angle = @previousAngle + ANG_INCREMENT * direction
                @rectangle.setAngle(angle % 360)

            when 'fire'
                return new BulletStatus(this)

        null

    updateQueue: (actions) ->
        @queue = actions.queue.concat(@queue)

class Engine
    constructor: (width, height, @maxTurns, @robots...) ->
        @round = 0 # unit of time

        @arena = new Arena(width, height)
        @robotsStatus = (new RobotStatus(robot, @arena) for robot in @robots)

    isDraw: ->
        return @round > @maxTurns

    safeCall: (obj, method, params...) ->
        if !obj[method]
            return
        obj[method].apply(obj, params)

    checkCollision: (robotStatus) ->
        actions = new RobotActions(robotStatus)

        for wall in @arena.walls
            if robotStatus.rectangle.intersects(wall.rectangle, false)
                robotStatus.rollbackAfterCollision()
                if robotStatus instanceof BulletStatus
                    @roundLog.events.push({
                        type: 'exploded',
                        id: robotStatus.id
                    })
                else
                    @safeCall(robotStatus.robot, 'onWallCollision', {robot: actions})

        return actions if robotStatus instanceof BulletStatus

        for status in @robotsStatus
            continue if status == robotStatus or !status.isAlive()

            if robotStatus.rectangle.intersects(status.rectangle)
                eventName = 'onRobotCollision'
                if status instanceof BulletStatus
                    continue if status.robotStatus == robotStatus
                    eventName = 'onHitByBullet'
                    robotStatus.takeHit(status)
                    @roundLog.events.push({
                        type: 'exploded',
                        id: status.id
                    })
                else
                    robotStatus.rollbackAfterCollision()

                bearing = ((status.rectangle.angle + 180 - robotStatus.rectangle.angle) + 360) % 360
                @safeCall(robotStatus.robot, eventName, {robot: actions, bulletBearing: bearing})

        actions

    checkSight: (robotStatus) ->
        actions = new RobotActions(robotStatus)

        virtualWidth = 2000
        virtualHeight = 1
        dirVec = new Vector2(robotStatus.rectangle.position.x + virtualWidth / 2, robotStatus.rectangle.position.y - virtualHeight / 2);
        dirVec.rotate(robotStatus.cannonTotalAngle(), robotStatus.rectangle.position)

        virtualRect = new Rectangle(
            dirVec.x,
            dirVec.y,
            virtualWidth, virtualHeight, robotStatus.cannonTotalAngle())

        robotStatus.tickScan()
        for status in @robotsStatus
            continue if status == robotStatus or !status.isAlive()
            continue unless status instanceof RobotStatus

            if robotStatus.canScan() and virtualRect.intersects(status.rectangle)
                robotStatus.preventScan()
                @safeCall(robotStatus.robot, 'onScannedRobot', {robot: actions})
                @roundLog.events.push({
                    type: 'onScannedRobot',
                    id: robotStatus.id
                })

        actions

    fight: ->
        aliveRobots = @robotsStatus.length

        fightLog = []

        while aliveRobots > 1 and not @isDraw()
            @round++

            fightLog.push(@roundLog = {
                round: @round,
                objects: [],
                events: []
            })

            aliveRobots = 0
            for status in @robotsStatus
                continue unless status.isAlive()

                @roundLog.objects.push({
                    type: if status instanceof RobotStatus then 'tank' else 'bullet'
                    id: status.id
                    position:
                        x: status.rectangle.position.x
                        y: status.rectangle.position.y
                    dimension:
                        width: status.rectangle.dimension.width
                        height: status.rectangle.dimension.height
                    life:
                        status.life
                    angle:
                        status.rectangle.angle
                    cannonAngle:
                        status.cannonAngle
                })

                if status.isIdle()
                    actions = new RobotActions(status)
                    @safeCall(status.robot, 'onIdle', {robot: actions})
                    status.updateQueue(actions)

                newStatus = status.runItem()
                @robotsStatus.push(newStatus) if newStatus

                actions = @checkCollision(status)
                status.updateQueue(actions)

                if status instanceof RobotStatus
                    aliveRobots++

            for status in @robotsStatus
                continue unless status.isAlive() and status instanceof RobotStatus
                actions = @checkSight(status)
                status.updateQueue(actions)

        return {
            draw: @isDraw()
            result: fightLog
        }
