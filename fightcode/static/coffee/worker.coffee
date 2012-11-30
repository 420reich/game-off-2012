worker = self
global = this

class Fight
    constructor: ->
        global.console = log: @log
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
                code.code = code.code.replace(/\/\/.*?\n/g, '').replace(/#.*?\n/g, '');
                robots.push(code)

            boardSize =
                width: 800
                height: 500

            maxRounds = 10000

            if evData.boardSize
                boardSize =
                    width: evData.boardSize.width
                    height: evData.boardSize.height

            if evData.maxRounds
                maxRounds = evData.maxRounds

            @streaming = evData.streaming
            @processFight(robots, maxRounds, boardSize)

    onRoundLog: (roundLog) =>
        worker.postMessage(
            type: "stream"
            roundLog: roundLog
        )

    processFight: (robots, maxRounds, boardSize) ->
        @overrideFunctions()

        for robot in robots
            robotCode = "(function() {#{ robot.code }; global.Robot = Robot;}.bind(global)()); return global.Robot;"
            robotConstructor = new @originalFunctions.func("global", robotCode)({})
            robot.constructor = robotConstructor

        engine = new Engine(boardSize.width, boardSize.height, maxRounds, @originalFunctions.random, robots...)
        if @streaming
            engine.roundLogCallback = @onRoundLog

        result = engine.fight()

        @restoreFunctions()

        eventData =
            type: "results"
            result: result.result

        worker.postMessage(eventData)

runFight = ->
    fight = new Fight()

runFight()
