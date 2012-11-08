do ->
    w = window
    for vendor in ['ms', 'moz', 'webkit', 'o']
        break if w.requestAnimationFrame
        w.requestAnimationFrame = w["#{vendor}RequestAnimationFrame"]
        w.cancelAnimationFrame = (w["#{vendor}CancelAnimationFrame"] or
                                  w["#{vendor}CancelRequestAnimationFrame"])

    targetTime = 0
    w.requestAnimationFrame or= (callback) ->
        targetTime = Math.max targetTime + 16, currentTime = +new Date
        w.setTimeout (-> callback +new Date), targetTime - currentTime

    w.cancelAnimationFrame or= (id) -> clearTimeout id

class Game
    constructor: (@board, @events, @options) ->
        @objects = {}
        @options = $.extend({
            msPerRound: 100
        }, @options)

    initialize: ->
        @lastRound = window.mozAnimationStartTime || Date.now()
        requestAnimationFrame(@play)

    createTank: (object) =>
        tank = $('<div class="tank"><div class="body"></div><div class="cannon"></div></div>')
        @board.append(tank)
        @objects[object.id] = tank
        return tank

    play: (timestamp) =>
        progress = timestamp - @lastRound
        rounds = progress / @options.msPerRound
        @lastRound = window.mozAnimationStartTime || Date.now()

        for roundNumber in [0..rounds]
            break if @events.length == 0
            round = @events.shift()
            for object in round.objects
                if object.type == 'tank'
                    if not @objects[object.id]
                        tank = @createTank(object)
                    else
                        tank = @objects[object.id]

                    tank.css('top', object.position.y)
                    tank.css('left', object.position.x)

        requestAnimationFrame(@play) if @events.length > 0
