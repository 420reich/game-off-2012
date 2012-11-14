# numberOfRounds = 1000

# rounds = []

# for i in [1..numberOfRounds]
#     round = {
#         round: i,
#         objects: [
#             type: 'tank'
#             id: 'tank001',
#             position:
#                 x: 10 + (i / 3)
#                 y: 100 + (i / 6)
#             health:
#                 100 - (i / 20)
#             angle:
#                 (i / 10)
#             cannonAngle:
#                 (i / 8)
#         ],

#         events: []
#     }

#     round.events.push(
#         type: 'moving',
#         id: 'tank001'
#     ) if i == 1

#     round.events.push(
#         type: 'backwards',
#         id: 'tank001'
#     ) if i == (numberOfRounds / 2)

#     round.events.push(
#         type: 'stopped',
#         id: 'tank001'
#     ) if i == numberOfRounds

#     round.events.push(
#         type: 'exploded',
#         id: 'bullet001'
#     ) if i == numberOfRounds - 10

#     round.objects.push(
#         type: 'bullet'
#         id: 'bullet001',
#         position:
#             x: round.objects[0].position.x + 100
#             y: round.objects[0].position.y + 100
#         angle:
#             45
#     ) if i >= 3 * numberOfRounds / 4

#     rounds.push(round)

#numberOfRobots = 5
#robots = []

#for i in [0..numberOfRobots - 1]
    #robot = new SampleRobot(i)
    #robots.push(robot)

#engine = new Engine(robots...)

#for i in [0..numberOfRobots - 1]
    #engine.robotsStatus[i].position = new Vector2(Math.random() * 700 + 50, Math.random() * 500 + 50)
    ##engine.robotsStatus[1].position = new Vector2(14, 13)

#rounds = engine.fight()

#board = $('.board')
#game = new Game(board, rounds,
    #msPerRound: 3
#)
#game.initialize()
