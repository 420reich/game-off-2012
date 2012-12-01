path = require('path')
fs = require('fs')
async = require('async')
basePath = path.join(process.env.CWD, 'fightcode')
vm = require('vm')

enginePath = path.join(basePath, 'static', 'output', 'fightcode.engine.min.js')

sequelize = require path.join(basePath, 'config', 'database')

User = sequelize.import(path.join(basePath, 'models', 'user'))
Fight = sequelize.import(path.join(basePath, 'models', 'fight'))
Robot = sequelize.import(path.join(basePath, 'models', 'robot'))
RobotRevision = sequelize.import(path.join(basePath, 'models', 'robotRevision'))
RobotRevisionFight = sequelize.import(path.join(basePath, 'models', 'robotRevisionFight'))
GithubApi = require 'github'

class FightRepository
    constructor: (@playerRobotId, @opponentRobotId, @userToken) ->

    findRobot: (gistId, callback) ->
        Robot.find({ where: {gist: gistId }}).success((robot) ->
            if robot
                callback(null, robot)
            else
                console.log("robot with gist #{ gistId } not found!")
                callback(404)
        )

    findLastGist: (gistId, callback) ->
        github = new GithubApi version: '3.0.0'
        github.authenticate type: 'oauth', token: @userToken

        github.gists.get(id: gistId, (err, githubResponse) ->
            console.dir(githubResponse);
            if not err
                code = githubResponse.files['robot.js'].content
                hash = githubResponse.history[0].version

                callback(null,
                    code: code
                    hash: hash
                )
            else
                console.log("gist #{ gistId } not found!")
                callback(404)
        )

    findOrCreateRobotRevision: (robot, gist, callback) ->
        RobotRevision.find({ where: {robot_id: robot.id, gist_hash: gist.hash}}).success((robotRevision) ->
            if not robotRevision
                robotRevision = RobotRevision.build(
                    robot_id: robot.id
                    gist_hash: gist.hash
                    code: gist.code
                )

            robotRevision.save().success(->
                callback(null, robotRevision)
            )
        )

    createRobotRevisionFight: (fight, robotRevision, engineRobot, robotPosition, callback) ->
        robotRevisionFight = RobotRevisionFight.build(
            fight_id: fight.id
            robot_revision_id: robotRevision.id
            position: robotPosition
            shots_fired: engineRobot.stats.bulletsFired
            shots_hit: engineRobot.stats.bulletsHit
            enemies_killed: engineRobot.stats.enemiesKilled
            position_x: engineRobot.robot.rectangle.position.x
            position_y: engineRobot.robot.rectangle.position.y
            angle: engineRobot.robot.rectangle.angle
        )

        robotRevisionFight.save().success(->
            callback(null, robotRevisionFight)
        )

    runFight: (player, opponent, callback) ->

        createContext = ->
            console: log: ->

        fs.readFile(enginePath, 'utf8', (err, data) ->
            init = """
                maxRounds = 10000;
                boardSize = {
                    width: 800,
                    height: 500
                };

                playerRobotInstance = player.Robot;
                opponentRobotInstance = opponent.Robot;

                player.constructor = playerRobotInstance;
                opponent.constructor = opponentRobotInstance;

                engineInstance = new engine.Engine(boardSize.width, boardSize.height, maxRounds, Math.random, player, opponent);
                result = engineInstance.fight();
            """

            playerContext = createContext()
            vm.runInNewContext(player.code.replace("var Robot", "Robot"), playerContext)
            playerRobot = playerContext.Robot

            opponentContext = createContext()
            vm.runInNewContext(opponent.code.replace("var Robot", "Robot"), opponentContext)
            opponentRobot = opponentContext.Robot

            engineContext = createContext()
            vm.runInNewContext(data, engineContext)

            basicContext = createContext()
            initContext =
                console: basicContext.console
                engine: engineContext
                player:
                    name: player.name
                    gist: player.gist
                    Robot: playerRobot
                opponent:
                    name: opponent.name
                    gist: opponent.gist
                    Robot: opponentRobot

            console.log('running the fight...')
            vm.runInNewContext(init, initContext)
            console.log('fight calculated successfully.')
            callback(null, initContext.result)
        )

    computeResults: (playerRobot, opponentRobot, fightResults, callback) ->
        if (fightResults.isDraw)
            playerRobot.addDraw()
            playerRobot.updateScore(playerRobot.score + 1, ->
                opponentRobot.addDraw()
                opponentRobot.updateScore(opponentRobot.score + 1, ->
                    callback(null, opponentRobot)
                )
            )
        else if (fightResults.robots[0].robot.gist == playerRobot.gist)
            percentage = Math.max(0.1, Math.min(9.0, opponentRobot.score / playerRobot.score))
            playerRobot.addVictory()
            playerRobot.updateScore(playerRobot.score + (percentage * 3), ->
                opponentRobot.addDefeat()
                opponentRobot.updateScore(opponentRobot.score - 1, ->
                    callback(null, opponentRobot)
                )
            )
        else
            percentage = Math.min(3.0, playerRobot.score / opponentRobot.score)
            opponentRobot.addVictory()
            opponentRobot.updateScore(opponentRobot.score + (percentage * 3), ->
                playerRobot.addDefeat()
                playerRobot.updateScore(playerRobot.score - 1, ->
                    callback(null, opponentRobot)
                )
            )

    createFight: (createFightCallback) ->
        self = this

        async.waterfall([
              (callback) ->
                  self.findLastGist(self.playerRobotId, callback)
            , (gist, callback) ->
                  self.playerGist = gist
                  self.findLastGist(self.opponentRobotId, callback)
            , (gist, callback) ->
                  self.opponentGist = gist

                  result = self.runFight({
                      gist: self.playerRobotId
                      name: "player"
                      code: self.playerGist.code
                  }, {
                      gist: self.opponentRobotId
                      name: "opponent"
                      code: self.opponentGist.code
                  }, callback)
            , (result, callback) ->
                  self.fightResult = result
                  fight = Fight.build({
                      randomSeed: Math.random()
                  })
                  fight.save().success(->
                      callback(null, fight)
                  )
            , (fight, callback) ->
                  self.fight = fight
                  self.findRobot(self.playerRobotId, callback)
            , (robot, callback) ->
                  self.playerRobot = robot
                  self.findOrCreateRobotRevision(self.playerRobot, self.playerGist, callback)
            , (robotRevision, callback) ->
                  self.playerRobotRevision = robotRevision

                  robotResult = null
                  robotPosition = 0

                  for robotIdx in [0..self.fightResult.robots.length]
                      robotResult = self.fightResult.robots[robotIdx]
                      robotPosition = robotIdx + 1
                      break if robotResult.robot.name == 'player'

                  if robotResult == null
                      callback(404)
                  else
                      self.createRobotRevisionFight(self.fight, robotRevision, robotResult, robotPosition, callback)

            , (robotRevisionFight, callback) ->
                  self.playerRobotRevisionFight = robotRevisionFight
                  self.findRobot(self.opponentRobotId, callback)
            , (robot, callback) ->
                  self.opponentRobot = robot
                  self.computeResults(self.playerRobot, robot, self.fightResult, callback)
            , (robot, callback) ->
                  self.findOrCreateRobotRevision(self.opponentRobot, self.opponentGist, callback)
            , (robotRevision, callback) ->
                  self.opponentRobotRevision = robotRevision

                  robotResult = null
                  robotPosition = 0

                  for robotIdx in [0..self.fightResult.robots.length]
                      robotResult = self.fightResult.robots[robotIdx]
                      robotPosition = robotIdx + 1
                      break if robotResult.robot.name == 'opponent'

                  if robotResult == null
                      callback(404)
                  else
                      self.createRobotRevisionFight(self.fight, robotRevision, robotResult, robotPosition, callback)

            , (robotRevisionFight, callback) ->
                  self.opponentRobotRevisionFight = robotRevisionFight
                  callback(null,
                      fight: self.fight
                      result: self.fightResult
                      player: self.playerRobotRevision
                      opponent: self.opponentRobotRevision
                  )
        ], (err, result) ->
            createFightCallback(404) if err
            createFightCallback(result) unless err
        )

exports.startFight = (req, res) ->
    myRobot = req.params[1]
    otherRobotId = req.params[2]

    res.render 'fightRobot', title: 'Fight Another Robot'

exports.createFight = (req, res) ->
    playerRobotId = req.params.robot_id
    opponentRobotId = req.params.opponent_id

    repository = new FightRepository(playerRobotId, opponentRobotId, req.user.token)

    repository.findRobot(playerRobotId, (err, robot) ->
        robot.getLastFightDate((date) ->
            diff = Math.abs(new Date() - date)
            if (diff < 30000)
                res.redirect("/robots/timeout/#{ robot.id }")
            else
                repository.createFight((result) ->
                    if result is 404
                        res.send(404)
                    else
                        res.redirect("/robots/replay/#{ result.fight.id }")
                )
        )
    )

exports.fightTest = (req, res) ->
    res.render 'fightTest', title: "Fight Test"

exports.randomFight = (req, res) ->
    playerRobotId = req.params.robot_id
    Robot.findRandomRobotGist(playerRobotId, (opponentRobotId) ->
        res.redirect("/robots/fight/#{ playerRobotId }/#{ opponentRobotId }")
    )

exports.replayFight = (req, res) ->
    fightId = req.params.fight_id

    RobotRevisionFight.findAll({where: {fight_id: fightId}}).success((robotRevisionFights) ->
        revisionFunctions = []
        for robotRevisionFight in robotRevisionFights
            do (robotRevisionFight) ->
                revisionFunctions.push((callback) ->
                    RobotRevision.find(robotRevisionFight.robot_revision_id).success((revision) ->
                        do (revision) ->
                            robotRevisionFight.code = revision.code

                            Robot.find(revision.robot_id).success((robot) ->
                                do (robot) ->
                                    robotRevisionFight.gistId = robot.gist
                                    robotRevisionFight.name = robot.title
                                    robotRevisionFight.color = robot.color

                                    User.find(where: id: robot.user_id).success((user) ->
                                        robotRevisionFight.user = user
                                        callback(null, revision, robot)
                                    )
                            )
                    )
                )

        async.parallel(revisionFunctions,
            (results) ->
                res.render 'fightRobot', revisions: robotRevisionFights, title: "Fight Replay ##{ fightId }"
        )
    )

exports.prepareFight = (req, res) ->
    Robot.find(where: id: req.params.robot_id).success((opponent) ->
        req.user.getRobots().success((myRobots) ->
            res.render 'prepareFight',
                layout: false,
                opponent: opponent,
                myRobots: myRobots
        )
    )

exports.timeoutView = (req, res) ->
    Robot.find(where: id: req.params.robot_id).success((robot) ->
        title = robot.title
        console.log(title)
        do (robot) ->
            robot.getLastFightDate((date) ->
                diff = Math.abs(new Date() - date) / 1000
                if (diff > 30)
                    res.redirect('/')
                else
                    res.render('timeout',
                        title: title
                        seconds: 30 - Math.floor(diff)
                    )
            )
    )

