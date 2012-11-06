class RobotActions
    constructor: (@robot) ->

    ahead: (amount) ->

    rotateCannon: (degrees) ->

    back: (amount) ->

    fire: (bullets) ->

    turn: (degrees) ->

class Engine
    constructor: (@robotA, @robotB) ->
        @round = 0 # unit of time
        #@boundFightRound = @fightRound.bind(this)

        @event = new EventEmitter

        for robot in [@robotA, @robotB]
            robot.life = 100
            robot.position = {
                x: Math.random() * 100
                y: Math.random() * 100
            }
            console.log "robot position x: #{ robot.position.x } y: #{ robot.position.y }"
            robot.init(this)

    isAlive: (robot) ->
        return robot.life > 0

    isDraw: ->
        return @round > 180

    fire: ->

    fight: ->
        @event.emit('fightStarted')

        @event.emit('onIdle', {
            robot: new RobotActions(@robotA)
        })
        @event.emit('onIdle', {
            robot: new RobotActions(@robotB)
        })

        #while @isAlive(@robotA) and @isAlive(@robotB) and not @isDraw()
            #@round++

            #@boundFightRound(@round)

        #if @isDraw()
            #console.log("DRAW!") if @isDraw()
        #else
            #console.log("Robot A WON!") if @robotA.isAlive()
            #console.log("Robot B WON!") if @robotB.isAlive()
            #console.log("DRAW!") if not @robotA.isAlive() and not @robotB.isAlive()

    #fightRound: (round) ->
        #@event.emit('roundStarted', this, round)
        #console.log "Round #{ @round } - #{ @robotA.name }=#{ @robotA.life }", "#{ @robotB.name }=#{ @robotB.life }"

