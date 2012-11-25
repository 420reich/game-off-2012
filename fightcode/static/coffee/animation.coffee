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
        @currentRound = 0
        @objects = {}
        @options = $.extend({
            msPerRound: 100
        }, @options)

    initialize: ->
        @lastRound = window.mozAnimationStartTime || Date.now()
        requestAnimationFrame(@play)

    createTank: (object) ->
        tank = $('<div class="tank"><div class="body"></div><div class="cannon"></div><div class="life"></div><div class="explosion"></div></div>')

        tankObject = {
            id: object.id
            tank: tank
            body: tank.find('.body')
            cannon: tank.find('.cannon')
            life: tank.find('.life')
        }

        @board.append(tank)
        @objects[object.id] = tankObject
        return tankObject

    createBullet: (object) ->
        bullet = $('<div class="bullet"><div class="explosion"></div></div>')
        @board.append(bullet)
        bulletObject = {
            id: object.id
            bullet: bullet
            width: bullet.width()
            height: bullet.height()
        }
        @objects[object.id] = bulletObject
        return bulletObject

    applyRotate: (object, angle) ->
        object.style.webkitTransform =
            object.style.mozTransform =
            object.style.transform = "rotate3d(0,0,1,#{ angle }deg)"

    handleTank: (object) ->
        tank = @objects[object.id] or @createTank(object)

        tank.tank[0].style.top = (object.position.y - (object.dimension.height / 2)) + 'px'
        tank.tank[0].style.left = (object.position.x - (object.dimension.width / 2)) + 'px'
        tank.life[0].style.width = (30 * object.life / 100) + 'px'

        @applyRotate(tank.body[0], object.angle)
        @applyRotate(tank.cannon[0], object.angle + object.cannonAngle)

    handleBullet: (object) ->
        bullet = @objects[object.id]

        bullet.bullet[0].style.top = (object.position.y - (bullet.height / 2)) + 'px'
        bullet.bullet[0].style.left = (object.position.x - (bullet.width / 2)) + 'px'

        @applyRotate(bullet.bullet[0], object.angle)

    removeBullet: (bulletObject) ->
        delete @objects[bulletObject.id]
        bulletObject.bullet.remove()

    play: (timestamp) =>
        progress = timestamp - @lastRound
        rounds = Math.floor(progress / @options.msPerRound)
        @lastRound = window.mozAnimationStartTime || Date.now()

        for roundNumber in [0..rounds]
            break if roundNumber + @currentRound >= @events.length
            round = @events[roundNumber + @currentRound]

            for object in round.objects
                switch object.type
                    when 'tank'
                        @handleTank(object)
                    when 'bullet'
                        @createBullet(object) unless @objects[object.id]
                        @handleBullet(object)

            for roundEvent in round.events
                object = @objects[roundEvent.id]
                continue unless object

                switch roundEvent.type
                    when 'moving'
                        object.tank[0].className = 'tank moving'
                    when 'backwards'
                        object.tank[0].className = 'tank moving backwards'
                    when 'stopped'
                        object.tank[0].className = 'tank'
                    when 'cloned'
                        object.tank[0].className = 'tank cloning'
                    when 'exploded'
                        object.bullet[0].className = 'bullet exploding'
                        setTimeout(@removeBullet.bind(this, object), 1000);
                    when 'dead'
                        object.tank[0].className = 'tank dead'

        @currentRound += rounds
        requestAnimationFrame(@play) if @events.length > 0
