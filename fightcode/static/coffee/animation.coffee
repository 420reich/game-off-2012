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
        tank = $('<div class="tank"><div class="body"></div><div class="cannon"></div><div class="life"></div></div>')

        tankObject = {
            tank: tank
            body: tank.find('.body')
            cannon: tank.find('.cannon')
            life: tank.find('.life')
        }

        @board.append(tank)
        @objects[object.id] = tankObject
        return tankObject

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

                    tank.tank.css('top', object.position.y)
                    tank.tank.css('left', object.position.x)
                    tank.cannon.css('transform', "rotate(#{ object.cannonAngle }deg)")

                    tank.life.css('width', 30 * object.health / 100)

            for event in round.events
                if event.type == 'moving'
                    @objects[event.id].tank.addClass('moving')
                if event.type == 'stopped'
                    @objects[event.id].tank.removeClass('moving')

        requestAnimationFrame(@play) if @events.length > 0
