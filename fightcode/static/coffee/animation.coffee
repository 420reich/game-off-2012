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

    createBullet: (object) =>
        bullet = $('<div class="bullet"><div class="explosion"></div></div>')
        @board.append(bullet)
        bulletObject = {
            bullet: bullet
            width: bullet.width()
            height: bullet.height()
        }
        @objects[object.id] = bulletObject
        return bulletObject

    handleTank: (object) =>
        tank = @objects[object.id] or @createTank(object)

        tank.tank.css('top', object.position.y - (object.dimension.height / 2))
        tank.tank.css('left', object.position.x - (object.dimension.width / 2))
        tank.body.css('transform', "rotate(#{ object.angle }deg)")

        tank.cannon.css('transform', "rotate(#{ object.angle + object.cannonAngle }deg)")

        tank.life.css('width', 30 * object.life / 100)

    handleBullet: (object) =>
        bullet = @objects[object.id] or @createBullet(object)

        bullet.bullet.css('top', object.position.y - (bullet.height / 2))
        bullet.bullet.css('left', object.position.x - (bullet.width / 2))
        bullet.bullet.css('transform', "rotate(#{ object.angle }deg)")

    play: (timestamp) =>
        progress = timestamp - @lastRound
        rounds = progress / @options.msPerRound
        @lastRound = window.mozAnimationStartTime || Date.now()

        for roundNumber in [0..rounds]
            break if @events.length == 0
            round = @events.shift()

            for object in round.objects
                switch object.type
                    when 'tank'
                        @handleTank(object)
                    when 'bullet'
                        @handleBullet(object)

            for event in round.events
                object = @objects[event.id]

                switch event.type
                    when 'moving'
                        object.tank.addClass('moving') if object
                    when 'backwards'
                        object.tank.addClass('backwards') if object
                    when 'stopped'
                        object.tank.removeClass('backwards').removeClass('moving') if object
                    when 'exploded'
                        object.bullet.addClass('exploding') if object

        requestAnimationFrame(@play) if @events.length > 0
