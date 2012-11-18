container = $(".fight-arena")

class FightArena
    constructor: (@container) ->
        @defaultCode = [
            "//FightCode can only understand your robot",
            "//if its class is called robotClass",
            "window.robotClass = function(){",
            "};",
            "window.robotClass.prototype.onIdle = function(ev) {",
            "   var robot = ev.robot;",
            "   robot.ahead(100);",
            "   robot.rotateCannon(360);",
            "   robot.back(100);",
            "   robot.rotateCannon(360);",
            "};",
            "window.robotClass.prototype.onScannedRobot = function(ev) {",
            "   var robot = ev.robot;",
            "   robot.fire();",
            "};"
        ].join('\n')
        @startWorker()

    startWorker: ->
        console.log "Starting worker..."
        worker = new Worker('/output/fightcode.worker.min.js')
        console.log "Worker started!"
        worker.onmessage = @receiveWorkerEvent
        console.log "Sending message"

        eventData =
            robots: 2
            robot1: @defaultCode
            robot2: @defaultCode

        console.log(eventData)
        worker.postMessage(eventData)
        console.log "Message sent"

    receiveWorkerEvent: (ev) ->
        evData = ev.data

        if evData.type is 'log'
            console.log "LOG", evData.message

        if evData.type is 'results'
            loading = container.find('.loading')
            loading.addClass('animate')
            setTimeout(
                ->
                    loading.detach()

                    game = new Game(container, evData.result, {
                        msPerRound: 12
                    })

                    game.initialize()
                , 700)

if container.length > 0
    arena = new FightArena(container)
