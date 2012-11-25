container = $(".fight-arena")

class FightArena
    constructor: (@container) ->
        @defaultCode = "
            window.robotClass = function(){
            };
            window.robotClass.prototype.onIdle = function(ev) {
               var robot = ev.robot;
               
               robot.rotateCannon(1);
               robot.fire();
            };
            window.robotClass.prototype.onScannedRobot = function(ev) {
               var robot = ev.robot;
               robot.fire();
               robot.clone();
            };
            window.robotClass.prototype.onHitByBullet = function(ev) {
               var robot = ev.robot;
               
               
            };"

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
            robots: 2
            robot1: @defaultCode
            robot2: @defaultCode
            # robot3: @wallCode
            # robot4: @wallCode

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
