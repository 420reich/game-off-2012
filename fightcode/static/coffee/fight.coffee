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

        @wallCode = "
            window.rotated = false;
            window.robotClass = function(){
            };
            window.robotClass.prototype.onIdle = function(ev) {
               var robot = ev.robot;
               robot.ahead(1);
               if (!window.rotated) {
                   robot.rotateCannon(90);
                   window.rotated = true;
               }
            };
            window.robotClass.prototype.onWallCollision = function(ev) {
               var robot = ev.robot;
               robot.back(10);
               robot.turn(90);
            };
            window.robotClass.prototype.onScannedRobot = function(ev) {
               var robot = ev.robot;
               robot.fire();
            };"


        @startWorker()

    startWorker: ->
        worker = new Worker('/output/fightcode.worker.min.js')
        worker.onmessage = @receiveWorkerEvent

        eventData =
            robots: 4
            robot1: @defaultCode
            robot2: @defaultCode
            robot3: @wallCode
            robot4: @wallCode

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

                    game = new Game(boardContainer, evData.result, {
                        msPerRound: 5
                    })

                    game.initialize()
                , 700)

if container.length > 0
    arena = new FightArena(container)
