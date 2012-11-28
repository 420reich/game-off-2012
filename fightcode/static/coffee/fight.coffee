container = $(".fight-arena")

class FightArena
    constructor: (@container) ->
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
            var Robot = function(robot){
              # robot.turn(-robot.angle)
              # robot.turnGunRight(360)
              # robot.ahead(200)
              # robot.turn(90)
              # robot.ahead(200)
              # robot.turn(90)
              # robot.ahead(200)
              # robot.turn(90)
              # robot.ahead(200)
            };
            Robot.prototype.onIdle = function(ev) {
               var robot = ev.robot;
               # robot.turn(1);
               # robot.fire();
               # robot.ahead(1)
               robot.turnGunRight(360)
            };
            Robot.prototype.onWallCollision = function(ev) {
            };
            Robot.prototype.onScannedRobot = function(ev) {
              ev.robot.fire()
            };
            Robot.prototype.onHitByBullet = function(ev) {
            };"""

        @wallCode = """
            var Robot = function(robot) {
              this.moveAmount = Math.max(robot.arenaWidth, robot.arenaHeight);

              robot.turnLeft(robot.angle % 90);
              robot.turnGunRight(90);
            };
            Robot.prototype.onIdle = function(ev) {
              var robot = ev.robot;
              # robot.back(1);
            };
            Robot.prototype.onWallCollision = function(ev) {
              var robot = ev.robot;
              robot.turnRight(90);
            };
            Robot.prototype.onHitByBullet = function(ev) {
              global.log(ev.bearing)
            };
            Robot.prototype.onRobotCollision = function(ev) {
              var robot = ev.robot;
              global.log(ev.bearing)
              if (ev.bearing > -90 && ev.bearing < 90) {
                robot.back(100);
              } else {
                robot.ahead(100);
              }
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
            robot1:
                name: "robot1"
                code: @rotateCode
                rectangle:
                  position:
                    x: 280
                    y: 200
                  angle: 0
            robot2:
                name: "robot2"
                code: @wallCode
                rectangle:
                  position:
                    x: 250
                    y: 250
                  angle: -90
            # robot3:
            #     name: "robot3"
            #     code: @defaultCode
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

                    game = new Game(boardContainer, evData, {
                        msPerRound: 5
                        onEndGame: (result) ->
                            console.log(result.winner.robot.name)
                    })

                    game.initialize()
                , 700)

if container.length > 0
    arena = new FightArena(container)
