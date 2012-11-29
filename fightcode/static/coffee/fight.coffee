class FightArena
    constructor: (@container, @robots, @onRound, @options) ->
        if not @options
            @options =
                maxRounds: 10000
                boardSize:
                    width: 800
                    height: 500

        @startWorker()

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
            maxRounds: @options.maxRounds
            boardSize:
                width: @options.boardSize.width
                height: @options.boardSize.height

        @worker.postMessage(eventData)

    receiveWorkerEvent: (ev) =>
        evData = ev.data

        if evData.type is 'log'
            console.log "LOG", evData.message

        if evData.type is 'results'
            board = @container.find('.board')
            board.empty()
            boardContainer = $('<div></div>')
            board.append(boardContainer)

            game = new Game(boardContainer, evData, {
                msPerRound: 5
            })

            game.initialize()

