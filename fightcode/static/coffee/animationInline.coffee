numberOfRounds = 1000

rounds = []

for i in [1..numberOfRounds]
    round = {
        round: i,
        objects: [
            type: 'tank'
            id: 'tank001',
            position:
                x: 10 + (i / 3)
                y: 11
            health:
                100 - (i / 5)
            angle:
                120
            cannonAngle:
                130 + i
        ],

        events: []
    }

    round.events.push(
        type: 'moving',
        id: 'tank001'
    ) if i == 1

    round.events.push(
        type: 'stopped',
        id: 'tank001'
    ) if i == numberOfRounds

    rounds.push(round)

board = $('.board')
game = new Game(board, rounds,
    msPerRound: 3
)
game.initialize()
