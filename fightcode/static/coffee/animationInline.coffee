rounds = []

for i in [1..400]
    rounds.push(
        round: i,
        objects: [
            type: 'tank'
            id: 'tank001',
            position:
                x: 10 + i
                y: 11
            health:
                100 - (i / 5)
            angle:
                120
            cannonAngle:
                130 + i
        ]
    )

board = $('.board')
game = new Game(board, rounds,
    msPerRound: 3
)
game.initialize()
