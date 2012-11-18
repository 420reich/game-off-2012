class Fight
    constructor: ->
        @bindEvents()

    log: (message) =>
        self.postMessage(
            type: "log"
            message: message
        )

    bindEvents: ->
        self.onmessage = (event) =>
            evData = event.data
            robots = []
            for i in [1..evData.robots]
                code = evData['robot' + i]
                robots.push(code)
            @processFight(robots)

    processFight: (robots) ->
        robotInstances = []
        for robot in robots
            robotCode = "with(window){#{ robot }\nreturn window.robotClass;}"
            constr = new Function("window", robotCode)({})
            robotInstance = new constr()
            robotInstances.push(robotInstance)

        engine = new Engine(800, 600, 20000, robotInstances...)

        for robotStatus in engine.robotsStatus
            robotStatus.rectangle.position = new Vector2(Math.random(800), Math.random(600))

        result = engine.fight()

        self.postMessage(
            type: "results"
            result: result
        )

fight = new Fight()
