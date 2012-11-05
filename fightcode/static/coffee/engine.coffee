class Engine
    constructor: (@robotA, @robotB) ->
        @round = 0 # unit of time
        @boundFightRound = @fightRound.bind(this)
        @eventPipeline = []

    nextEvent: ->
        return @eventPipeline.shift() if eventPipeline.length > 0
        null

    isDraw: ->
        return @round > 180

    fight: ->
        while @robotA.isAlive() and @robotB.isAlive() and not @isDraw()
            @round++
            @boundFightRound(@round)

        if @isDraw()
            console.log("DRAW!") if @isDraw()
        else
            console.log("Robot A WON!") if @robotA.isAlive()
            console.log("Robot B WON!") if @robotB.isAlive()

    fightRound: (round) ->
        random = Math.floor(Math.random() * 2) + 1
        console.log "Round #{ @round } - #{ @robotA.name }=#{ @robotA.life }", "#{ @robotB.name }=#{ @robotB.life }"

        @robotA.takeDamage(1) if random == 1
        @robotB.takeDamage(1) if random != 1
