class FightArena
    constructor: (@container, @robots) ->
        @defaultCode = """
            var Robot = function(){
            };
            Robot.prototype.onIdle = function(ev) {
               var robot = ev.robot;
               
               robot.rotateCannon(180);
               robot.ahead(100);
               robot.turn(45);
            };
            Robot.prototype.onScannedRobot = function(ev) {
               var robot = ev.robot,
                   scannedRobot = ev.scannedRobot;

               if (robot.id == scannedRobot.parentId || robot.parentId == scannedRobot.id) {
                   return;
               }
               robot.fire();
            };
            Robot.prototype.onHitByBullet = function(ev) {
               var robot = ev.robot;
               
               if (robot.availableClones > 0) {
                   robot.clone();
               }
            };"""

        @rotateCode = """
            var Robot = function(){
            };
            Robot.prototype.onIdle = function(ev) {
               var robot = ev.robot;

               robot.turn(1);
               robot.fire();
            };
            Robot.prototype.onWallCollision = function(ev) {
            };
            Robot.prototype.onScannedRobot = function(ev) {
            };
            Robot.prototype.onHitByBullet = function(ev) {
            };"""

        @wallCode = """
            var Robot = function(robot) {
              robot.turn(90 - (robot.angle % 90));
              robot.rotateCannon(90);
            };
            Robot.prototype.onIdle = function(ev) {
               var robot = ev.robot;
               robot.ahead(1);
            };
            Robot.prototype.onWallCollision = function(ev) {
               var robot = ev.robot;
               robot.turn(90);
            };
            Robot.prototype.onRobotCollision = function(ev) {
               var robot = ev.robot;
               robot.back(100);
               robot.turn(270);
               robot.clone();
            };
            Robot.prototype.onScannedRobot = function(ev) {
               var robot = ev.robot;
               robot.fire();
            };"""


        @startWorker()

    startWorker: ->
        worker = new Worker('/output/fightcode.worker.min.js')
        worker.onmessage = @receiveWorkerEvent

        eventData =
            robots: 2
            robot1: @robots[0]
            robot2: @robots[1]

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

                    game = new Game(boardContainer, evData, {
                        msPerRound: 1
                        onEndGame: (result) ->
                            console.log(result)
                    })

                    game.initialize()
                , 700)

