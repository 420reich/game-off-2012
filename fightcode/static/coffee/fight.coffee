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
        worker = new Worker('/output/fightcode.worker.min.js')
        worker.onmessage = @receiveWorkerEvent

        eventData =
            robots: 2
            robot1: @defaultCode
            robot2: @defaultCode

        worker.postMessage(eventData)

    receiveWorkerEvent: (ev) ->
        evData = ev.data

        if evData.type is 'log'
            console.log "LOG", evData.message

        if evData.type is 'results'
            board = container.find('.board')
            board.empty()
            boardContainer = $('<div></div>')
            board.append(boardContainer)

            loading = container.find('.loading')
            loading.addClass('animate')

            setTimeout(
                ->
                    loading.detach()

                    console.log(evData.result)
                    game = new Game(boardContainer, evData.result, {
                        msPerRound: 7
                    })

                    game.initialize()
                , 700)

if container.length > 0
    arena = new FightArena(container)
