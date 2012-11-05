class Robot
    constructor: (@name) ->
        @life = 100

    isAlive: ->
        @life > 0

    takeDamage: (dmg) ->
        @life -= dmg
