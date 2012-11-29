MOVE_INCREMENT = 1
ANG_INCREMENT = 1
PI2 = Math.PI * 2
RAD2DEG = 180 / Math.PI

normalizeAngle = (a) ->
     ((a % 360) + 360) % 360

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

    dot: (other) ->
        @x * other.x + @y * other.y

    @add: (v1, v2) ->
        new Vector2(v1.x + v2.x, v1.y + v2.y)

    @subtract: (v1, v2) ->
        new Vector2(v1.x - v2.x, v1.y - v2.y)

    @divide: (v1, scalar) ->
        new Vector2(v1.x / scalar, v1.y / scalar)

    @multiply: (v1, scalar) ->
        new Vector2(v1.x * scalar, v1.y * scalar)

class RobotActions
    constructor: (currentStatus) ->
        @id = currentStatus.id
        @angle = normalizeAngle(currentStatus.rectangle.angle + 90)
        @cannonRelativeAngle = normalizeAngle(currentStatus.cannonAngle + 90)
        @cannonAbsoluteAngle = normalizeAngle(@angle + @cannonRelativeAngle)
        @position = new Vector2(currentStatus.rectangle.position)
        @life = currentStatus.life
        @gunCoolDownTime = currentStatus.gunCoolDownTime
        @availableClones = currentStatus.availableClones
        @parentId = if currentStatus.parentStatus then currentStatus.parentStatus.id else null
        @arenaWidth = currentStatus.arena.width
        @arenaHeight = currentStatus.arena.height
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
        @queue.push
            action: "rotateCannon"
            direction: degrees
            count: Math.abs(degrees) / ANG_INCREMENT

    turnGunLeft: (degrees) ->
        @rotateCannon(-degrees)

    turnGunRight: (degrees) ->
        @rotateCannon(degrees)

    turn: (degrees) ->
        return if degrees == 0
        @queue.push
            action: "turn"
            direction: degrees
            count: Math.abs(degrees) / ANG_INCREMENT

    turnLeft: (degrees) ->
        @turn(-degrees)

    turnRight: (degrees) ->
        @turn(degrees)

    fire: (bullets) ->
        @queue.push
            action: "fire"

    notify: (callback) ->
        @queue.push
            action: "notify",
            callback: callback

    stop: (callback) ->
        @queue = [
            action: "stop"
        ]

    clone: ->
        @queue.push(action: "clone")

    log: (messages...) ->
        @queue.push
            action: "log"
            messages: messages

    ignore: (eventName) ->
        @queue.push
            action: "ignore"
            eventName: eventName

    listen: (eventName) ->
        @queue.push
            action: "listen"
            eventName: eventName

class Arena
    constructor: (@width, @height) ->
        @rectangle = new Rectangle(@width / 2, @height / 2, @width, @height)

class Line
    constructor: (x1, y1, x2, y2) ->
        @p1 = new Vector2(x1, y1)
        @p2 = new Vector2(x2, y2)

class Rectangle
    constructor: (x = 0, y = 0, width = 1, height = 1, @angle = 0) ->
        @position = new Vector2(x, y)
        @setDimension(width, height)
        @updateCoords()

    setAngle: (angle) ->
        @angle = normalizeAngle(angle)
        @updateCoords()

    setDimension: (width, height) ->
        @dimension = {
            width: width,
            height: height
        }
        @halfWidth = width / 2
        @halfHeight = height / 2
        @radius = Math.sqrt(@halfWidth * @halfWidth + @halfHeight * @halfHeight)
        @minRadius = Math.min(@halfWidth, @halfHeight)
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

    containingCollisionAngle: (otherRectangle) ->
        rad = @minRadius

        if @position.x - rad <= otherRectangle.upperLeft.x
            return 270
        if @position.x + rad >= otherRectangle.lowerRight.x
            return 90
        if @position.y - rad <= otherRectangle.upperLeft.y
            return 360
        if @position.y + rad >= otherRectangle.lowerRight.y
            return 180

        false

    intersects: (other) ->
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
    constructor: (x1, y1, x2, y2) ->
        super()
        @line = new Line(x1, y1, x2, y2)

class BulletStatus extends ElementStatus
    constructor: (@robotStatus) ->
        super()
        @rectangle.setAngle(@robotStatus.rectangle.angle + @robotStatus.cannonAngle)

        angleRad = (@rectangle.angle * Math.PI) / 180
        @sinAngle = Math.sin(angleRad)
        @cosAngle = Math.cos(angleRad)

        xInc = @cosAngle * (@robotStatus.rectangle.dimension.width / 2)
        yInc = @sinAngle * (@robotStatus.rectangle.dimension.height / 2)
        @rectangle.setPosition(@robotStatus.rectangle.position.x + xInc, @robotStatus.rectangle.position.y + yInc)
        @rectangle.setDimension(2, 2)

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
    @deathOrder: 1

    constructor: (@robot, @arena) ->
        super()
        @life = 100
        @cannonAngle = 0
        @rectangle.setDimension(27, 24)
        @baseScanWaitTime = 50
        @baseGunCoolDownTime = 50
        @scanWaitTime = 0
        @gunCoolDownTime = 0
        @availableClones = 1
        @queue = []
        @clones = []
        @parentStatus = null
        @bulletsFired = 0
        @bulletsHit = 0
        @deathIdx = null
        @enemiesKilled = 0
        @friendsKilled = 0
        @ignoredEvents = {}
        @accidentalCollisions = {}

    instantiateRobot: ->
        actions = new RobotActions(this)
        @robot.instance = new @robot.constructor(actions)
        @updateQueue(actions)

    clone: ->
        cloneRobotStatus = new RobotStatus(@robot, @arena)
        cloneRobotStatus.rectangle.setAngle(@rectangle.angle)
        cloneRobotStatus.rectangle.setPosition(@rectangle.position.x, @rectangle.position.y)
        cloneRobotStatus.life = @life / 4
        cloneRobotStatus.availableClones = 0
        cloneRobotStatus.parentStatus = this
        @clones.push(cloneRobotStatus)
        cloneRobotStatus

    stats: ->
        {
            bulletsFired: @clones.reduce (a, b) ->
                a + b.bulletsFired
            , @bulletsFired

            bulletsHit: @clones.reduce (a, b) ->
                a + b.bulletsHit
            , @bulletsHit

            enemiesKilled: @clones.reduce (a, b) ->
                a + b.enemiesKilled
            , @enemiesKilled

            friendsKilled: @clones.reduce (a, b) ->
                a + b.friendsKilled
            , @friendsKilled
        }

    getAccidentalCollisions: ->
        ac = @accidentalCollisions
        @accidentalCollisions = {}
        return ac

    addAccidentalCollision: (status) ->
        @accidentalCollisions[status.id] = true

    isClone: ->
        !!@parentStatus

    isAlive: ->
        @life > 0 and (@parentStatus == null or @parentStatus.life > 0)

    isIdle: ->
        @queue.length == 0

    takeHit: (bulletStatus) ->
        @life -= bulletStatus.strength
        bulletStatus.destroy()
        bulletStatus.robotStatus.bulletsHit += 1
        unless @isAlive()
            @deathIdx = RobotStatus.deathOrder++
            if bulletStatus.robotStatus.parentStatus == this or bulletStatus.robotStatus in @clones
                bulletStatus.robotStatus.friendsKilled += 1
            else
                bulletStatus.robotStatus.enemiesKilled += 1

    rollbackAfterCollision: ->
        @rectangle.setPosition(@previousPosition.x, @previousPosition.y) if @previousPosition
        @rectangle.setAngle(@previousAngle) if @previousAngle

    cannonTotalAngle: ->
        normalizeAngle(@rectangle.angle + @cannonAngle)

    canScan: ->
        @scanWaitTime == 0

    tickScan: ->
        @scanWaitTime -= 1 if @scanWaitTime > 0

    preventScan: ->
        @scanWaitTime = @baseScanWaitTime

    abortCurrentMovement: ->
        @queue.shift() if @queue.length > 0 and @queue[0].started

    runItem: ->
        @gunCoolDownTime-- if @gunCoolDownTime > 0

        item = @queue.shift()
        while item and item.action == 'log'
            @roundLog.events.push({
                type: 'log',
                messages: item.messages,
                id: @id
            })
            item = @queue.shift()

        return unless item

        if 'count' of item
            item.started = true
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
                @previousCannonAngle = @cannonAngle
                @cannonAngle += ANG_INCREMENT * direction
                @cannonAngle = normalizeAngle(@cannonAngle)

            when 'turn'
                @previousAngle = @rectangle.angle
                angle = @previousAngle + ANG_INCREMENT * direction
                @rectangle.setAngle(angle)

            when 'fire'
                return unless @gunCoolDownTime == 0
                @gunCoolDownTime = @baseGunCoolDownTime
                @bulletsFired += 1
                return new BulletStatus(this)

            when 'clone'
                return unless @availableClones
                @availableClones--
                return @clone()

            when 'notify'
                item.callback and item.callback()

            when 'ignore'
                @ignoredEvents[item.eventName] = true

            when 'listen'
                delete @ignoredEvents[item.eventName]

        null

    updateQueue: (actions) ->
        if actions.queue.length > 0 and actions.queue[0].action == 'stop'
            @queue = actions.queue.slice(1)
        else
            @queue = actions.queue.concat(@queue)


class Engine
    constructor: (width, height, @maxTurns, @randomFunc, robotsData...) ->
        @round = 0

        @arena = new Arena(width, height)

        @robotsStatus = (new RobotStatus(robotData, @arena) for robotData in robotsData)
        @deadStatuses = []
        @initPositions()
        for robotStatus in @robotsStatus
            robotStatus.instantiateRobot()

    initPositions: ->
        for robotStatus in @robotsStatus
            givenRect = robotStatus.robot.rectangle
            if givenRect
                robotStatus.rectangle.setPosition(givenRect.position.x, givenRect.position.y)
                robotStatus.rectangle.setAngle(givenRect.angle)
            else
                rx = Math.floor(@randomFunc() * @arena.rectangle.dimension.width)
                ry = Math.floor(@randomFunc() * @arena.rectangle.dimension.height)
                angle = Math.floor(@randomFunc() * 360)
                robotStatus.rectangle.setAngle(angle)
                robotStatus.rectangle.setPosition(rx, ry)
                @findEmptyPosition(robotStatus)
                robotStatus.robot.rectangle = {}
                robotStatus.robot.rectangle.position = new Vector2(robotStatus.rectangle.position)
                robotStatus.robot.rectangle.angle = robotStatus.rectangle.angle

    isDraw: ->
        return @round > @maxTurns

    safeCall: (obj, method, params...) ->
        if !obj[method]
            return
        obj[method].apply(obj, params)

    intersectsAnything: (robotStatus) ->
        if robotStatus.rectangle.containingCollisionAngle(@arena.rectangle)
            return true

        for status in @robotsStatus
            continue if status == robotStatus or !status.isAlive()
            if robotStatus.rectangle.intersects(status.rectangle)
                return true

        false

    findEmptyPosition: (robotStatus) ->
        arenaW = @arena.width
        arenaH = @arena.height
        robotW = robotStatus.rectangle.dimension.width
        robotH = robotStatus.rectangle.dimension.height
        baseX = robotStatus.rectangle.position.x
        baseY = robotStatus.rectangle.position.y

        for y in [0..arenaH - 1] by robotH
            for x in [0..arenaW - 1] by robotW
                ny = (y + baseY + robotH) % arenaH
                nx = (x + baseX + robotW) % arenaW
                robotStatus.rectangle.setPosition(nx, ny)
                return robotStatus unless @intersectsAnything(robotStatus)

        return false

    checkCollision: (robotStatus) ->
        actions = if robotStatus instanceof RobotStatus then new RobotActions(robotStatus) else null

        wallCollisionAngle = robotStatus.rectangle.containingCollisionAngle(@arena.rectangle)
        if wallCollisionAngle
            robotStatus.rollbackAfterCollision()
            if robotStatus instanceof BulletStatus
                robotStatus.destroy()
                @roundLog.events.push({
                    type: 'exploded',
                    id: robotStatus.id
                })
            else
                bearing = normalizeAngle(wallCollisionAngle - robotStatus.rectangle.angle - 90)
                bearing -= 360 if bearing > 180
                robotStatus.abortCurrentMovement()
                unless robotStatus.ignoredEvents['onWallCollision']
                    @safeCall(robotStatus.robot.instance, 'onWallCollision', {robot: actions, bearing: bearing})

        return actions if robotStatus instanceof BulletStatus

        accidentalCollisions = robotStatus.getAccidentalCollisions()

        for status in @robotsStatus
            continue if status == robotStatus or !status.isAlive()

            isEnemyRobot = status instanceof RobotStatus

            if robotStatus.rectangle.intersects(status.rectangle)
                eventName = 'onRobotCollision'
                if status instanceof BulletStatus
                    bearing = normalizeAngle(status.rectangle.angle + 180 - robotStatus.rectangle.angle)
                    continue if status.robotStatus == robotStatus
                    eventName = 'onHitByBullet'
                    robotStatus.takeHit(status)
                    @roundLog.events.push({
                        type: 'exploded',
                        id: status.id
                    })
                    unless robotStatus.isAlive()
                        @roundLog.events.push({
                            type: 'dead',
                            id: robotStatus.id
                        })
                        for clone in robotStatus.clones
                            @roundLog.events.push({
                                type: 'dead',
                                id: clone.id
                            })
                else
                    vec = Vector2.subtract(status.rectangle.position, robotStatus.rectangle.position)
                    bearing = normalizeAngle((Math.atan2(vec.y, vec.x) * 180 / Math.PI) - robotStatus.rectangle.angle)
                    robotStatus.rollbackAfterCollision()
                    robotStatus.abortCurrentMovement()

                bearing -= 360 if bearing > 180
                unless robotStatus.ignoredEvents[eventName]
                    @safeCall(robotStatus.robot.instance, eventName, {
                        robot: actions
                        bearing: bearing
                        collidedRobot: if isEnemyRobot then @basicEnemyInfo(status) else null
                        myFault: !!isEnemyRobot
                    })
                status.addAccidentalCollision(robotStatus) if isEnemyRobot

            else if isEnemyRobot and accidentalCollisions[status.id]
                unless robotStatus.ignoredEvents[eventName]
                    vec = Vector2.subtract(status.rectangle.position, robotStatus.rectangle.position)
                    bearing = normalizeAngle((Math.atan2(vec.y, vec.x) * 180 / Math.PI) - robotStatus.rectangle.angle)
                    bearing -= 360 if bearing > 180

                    @safeCall(robotStatus.robot.instance, eventName, {
                        robot: actions
                        bearing: bearing
                        collidedRobot: @basicEnemyInfo(status)
                        myFault: false
                    })

        actions

    checkSight: (robotStatus) ->
        actions = new RobotActions(robotStatus)

        robotStatus.tickScan()

        return actions unless robotStatus.canScan()
        return actions if robotStatus.ignoredEvents['onScannedRobot']

        virtualWidth = 2000
        virtualHeight = 1
        dirVec = new Vector2(robotStatus.rectangle.position.x + virtualWidth / 2, robotStatus.rectangle.position.y - virtualHeight / 2);
        dirVec.rotate(robotStatus.cannonTotalAngle(), robotStatus.rectangle.position)

        virtualRect = new Rectangle(
            dirVec.x,
            dirVec.y,
            virtualWidth, virtualHeight, robotStatus.cannonTotalAngle())

        robotInSight = null
        minDistance = Infinity
        for status in @robotsStatus
            continue if status == robotStatus or !status.isAlive()
            continue unless status instanceof RobotStatus

            if virtualRect.intersects(status.rectangle)
                dist = Vector2.subtract(status.rectangle.position, robotStatus.rectangle.position).module()
                if dist < minDistance
                    robotInSight = status
                    minDistance = dist

        if robotInSight
            robotStatus.preventScan()
            @safeCall(robotStatus.robot.instance, 'onScannedRobot', {
                robot: actions
                scannedRobot: @basicEnemyInfo(robotInSight)
            })
            @roundLog.events.push({
                type: 'onScannedRobot',
                id: robotStatus.id
            })

        actions

    basicEnemyInfo: (status) ->
        id: status.id
        position: new Vector2(status.rectangle.position)
        angle: status.rectangle.angle
        cannonAngle: status.cannonAngle
        life: status.life
        parentId: if status.parentStatus then status.parentStatus.id else null

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

                status.roundLog = @roundLog
                @roundLog.objects.push({
                    type: if status instanceof RobotStatus then 'tank' else 'bullet'
                    id: status.id
                    name: if status instanceof RobotStatus then status.robot.name else 'bullet'
                    color: if status instanceof RobotStatus then status.robot.color else null
                    isClone: if status instanceof RobotStatus then status.isClone() else false
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
                    parentId: status.parentStatus and status.parentStatus.id
                })

                if status.isIdle()
                    actions = new RobotActions(status)
                    @safeCall(status.robot.instance, 'onIdle', {robot: actions})
                    status.updateQueue(actions)

                newStatus = status.runItem()
                if newStatus
                    @robotsStatus.push(newStatus)
                    if newStatus instanceof RobotStatus
                        @findEmptyPosition(newStatus)
                        @roundLog.events.push({
                            type: 'cloned'
                            id: status.id
                            cloneId: newStatus.id
                        })

                actions = @checkCollision(status)
                if actions
                    status.updateQueue(actions)

                if status instanceof RobotStatus and not status.isClone()
                    aliveRobots++

            for status in @robotsStatus
                continue unless status.isAlive() and status instanceof RobotStatus
                actions = @checkSight(status)
                status.updateQueue(actions)

            if @roundLogCallback
                @roundLogCallback(@roundLog)

        robotsOnly = @robotsStatus.filter (el) ->
            el instanceof RobotStatus and not el.isClone()

        sortedRobots = robotsOnly.sort (a, b) ->
            vA = if a.deathIdx then a.deathIdx else a.life * 1000
            vB = if b.deathIdx then b.deathIdx else b.life * 1000
            vB - vA

        for r in sortedRobots
            stats = r.stats = r.stats()
            console.log(r.robot.name, r.deathIdx, r.life, stats.bulletsFired, stats.bulletsHit, stats.friendsKilled, stats.enemiesKilled)

        return {
            isDraw: @isDraw()
            robots: sortedRobots
            result: fightLog
        }
