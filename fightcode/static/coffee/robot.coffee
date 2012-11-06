class Robot
    constructor: (@name) ->
        @life = 100
        @engine = null

    isAlive: ->
        @life > 0

    takeDamage: (dmg) ->
        @life -= dmg

    bindEvents: ->

    fire: ->


class SampleRobot extends Robot
    constructor: (@name) ->
        super "Sample #{ @name }"

    bindEvents: ->
        self = this

        @engine.event.on('roundStarted', (round) ->
            @fire(self)
        )
