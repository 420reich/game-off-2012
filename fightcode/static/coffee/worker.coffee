worker = self

class Fight
    constructor: ->
        @bindEvents()

    log: (message) =>
        worker.postMessage(
            type: "log"
            message: message
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
        maxRounds = 10000
        boardSize =
            width: 800
            height: 500

        robotInstances = []
        for robot in robots
            robotCode = "with(window){#{ robot }\nreturn window.robotClass;}"
            constr = new Function("window", robotCode)({})
            robotInstance = new constr()
            robotInstances.push(robotInstance)

        engine = new Engine(boardSize.width, boardSize.height, maxRounds, robotInstances...)

        for robotStatus in engine.robotsStatus
            robotStatus.rectangle.position = new Vector2(Math.random() * boardSize.width, Math.random() * boardSize.height)

        result = engine.fight()

        eventData =
            type: "results"
            result: result.result

        worker.postMessage(eventData)

fight = new Fight()
