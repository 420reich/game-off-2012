class FightArena
    constructor: (@container, @robots, @onRound, @options) ->
        @options = $.extend({
                maxRounds: 10000
                onEndGame: (result)->
                boardSize:
                    width: 800
                    height: 500}, @options)

        @terminated = false
        @worker = null
        @game = null
        @startWorker()

    stop: ->
        @terminated = true
        @worker.terminate()
        @game and @game.forceEnd()

    setRobots: (robots) ->
        @robots = robots

    startWorker: ->
        if not @worker
            @worker = new Worker('/output/fightcode.worker.min.js')
            @worker.onmessage = @receiveWorkerEvent

        eventData =
            robots: @robots.length
            robot1: @robots[0]
            robot2: @robots[1]
            streaming: @options.streaming
            maxRounds: @options.maxRounds
            boardSize:
                width: @options.boardSize.width
                height: @options.boardSize.height

        if @options.streaming
            @startGame()

        @worker.postMessage(eventData)

    startGame: (data) ->
        if @game
            @game.end()
            return

        board = @container.find('.board')
        board.empty()
        boardContainer = $('<div></div>')
        board.append(boardContainer)

        @game = new Game(boardContainer, data, {
            msPerRound: 5
            onRound: @onRound
            onEndGame: @options.onEndGame
        })
        @game.start()

    receiveWorkerEvent: (ev) =>
        return if @terminated

        evData = ev.data

        if evData.type is 'log'
            console.log "LOG", evData.message

        if evData.type is 'stream'
            @game.addRound(evData.roundLog)

        if evData.type is 'results'
            @startGame(evData)

