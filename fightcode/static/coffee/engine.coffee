class Engine
    constructor: (@robotA, @robotB) ->
        @boundFightRound = @fightRound.bind(this)
        @eventPipeline = []

    nextEvent: ->
        return @eventPipeline.shift() if eventPipeline.length > 0
        null

    fight: ->
        setTimeout @boundFightRound, 1000

    fightRound: ->
        console.log "#{ @robotA.name }=#{ @robotA.life }", "#{ @robotB.name }=#{ @robotB.life }"
        setTimeout @boundFightRound, 1000 if @robotA.isAlive() and @robotB.isAlive()
