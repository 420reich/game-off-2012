worker = self
global = this

class Fight
    constructor: ->
        @bindEvents()

    overrideFunctions: ->
        @originalFunctions = {
            setTimeout: global.setTimeout,
            setInterval: global.setInterval,
            XmlHttpRequest: global.XmlHttpRequest,
            Date: global.Date,
            random: Math.random,
            eval: global.eval,
            func: global.Function
        }
        global.setTimeout = ->
        global.setInterval = ->
        global.XmlHttpRequest = ->
        global.Date = -> null
        Math.random = -> 0
        global.eval = ->
        global.Function = ->

    restoreFunctions: ->
        global.setTimeout = @originalFunctions.setTimeout
        global.setInterval = @originalFunctions.setInterval
        global.XmlHttpRequest = @originalFunctions.XmlHttpRequest
        global.Date = -> @originalFunctions.Date
        Math.random = -> @originalFunctions.random
        global.eval = @originalFunctions.eval
        global.Function = @originalFunctions.func

    log: (messages...) ->
        worker.postMessage(
            type: "log"
            message: messages.join(', ')
        )

    bindEvents: ->
        worker.onmessage = (event) =>
            evData = event.data
            robots = []
            for i in [1..evData.robots]
                code = evData['robot' + i]
                robots.push(code)
            @processFight(robots)

    processFight: (robots) ->
        @overrideFunctions()

        maxRounds = 10000
        boardSize =
            width: 800
            height: 500

        robotInstances = []
        for robot in robots
            robotCode = "(function() {#{ robot.code }}.bind(window)()); return window.robotClass;"
            constr = new @originalFunctions.func("window", robotCode)({
                log: (message...) =>
                    this.log(message...)
            })
            robotInstance = new constr()
            robot.instance = robotInstance
            robotInstances.push(robot)

        engine = new Engine(boardSize.width, boardSize.height, maxRounds, robotInstances...)
        engine.log = this.log;

        engine.robotsStatus[0].rectangle.setPosition(13, 13)
        engine.robotsStatus[1].rectangle.setPosition(50, 200)
        engine.robotsStatus[2].rectangle.setPosition(100, 200)

        result = engine.fight()

        @restoreFunctions()

        eventData =
            type: "results"
            result: result.result
            winner: result.winner

        worker.postMessage(eventData)

runFight = ->
    fight = new Fight()

runFight()