worker = self

class Fight
    constructor: ->
        @bindEvents()

    log: (messages...) =>
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
        maxRounds = 5000
        boardSize =
            width: 800
            height: 500

        robotInstances = []
        for robot in robots
            robotCode = "(function() {#{ robot }}.bind(window)()); return window.robotClass;"
            constr = new Function("window", robotCode)({
                log: (message...) =>
                    this.log(message...)
            })
            robotInstance = new constr()
            robotInstances.push(robotInstance)

        engine = new Engine(boardSize.width, boardSize.height, maxRounds, robotInstances...)

        # for robotStatus in engine.robotsStatus
        engine.robotsStatus[0].rectangle.setPosition(50, 50)
        engine.robotsStatus[1].rectangle.setPosition(50, 200)

        result = engine.fight()

        eventData =
            type: "results"
            result: result.result
            winner: result.winner

        worker.postMessage(eventData)

fight = new Fight()
