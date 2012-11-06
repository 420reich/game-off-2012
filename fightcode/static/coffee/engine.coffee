class Engine
    constructor: (@robotA, @robotB) ->
        @round = 0 # unit of time
        @boundFightRound = @fightRound.bind(this)

        @event = new EventEmitter

        for robot in [@robotA, @robotB]
            robot.engine = this
            robot.bindEvents()

    isDraw: ->
        return @round > 180

    fire: (robot) ->
        random = Math.floor(Math.random() * 10) + 1
        return false if random > 3
        @robotA.takeDamage(2) if robot == @robotB
        @robotB.takeDamage(2) if robot == @robotA

    fight: ->
        @event.emit('fightStarted')

        while @robotA.isAlive() and @robotB.isAlive() and not @isDraw()
            @round++
            @boundFightRound(@round)

        if @isDraw()
            console.log("DRAW!") if @isDraw()
        else
            console.log("Robot A WON!") if @robotA.isAlive()
            console.log("Robot B WON!") if @robotB.isAlive()

    fightRound: (round) ->
        @event.emit('roundStarted', this, round)
        console.log "Round #{ @round } - #{ @robotA.name }=#{ @robotA.life }", "#{ @robotB.name }=#{ @robotB.life }"
