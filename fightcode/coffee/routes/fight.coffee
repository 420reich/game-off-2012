path = require('path')
async = require('async')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

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
                callback(404)
        )

    findLastGist: (gistId, callback) ->
        github = new GithubApi version: '3.0.0'
        github.authenticate type: 'oauth', token: @userToken

        github.gists.get(id: gistId, (err, githubResponse) ->
            if not err
                code = githubResponse.files['robot.js'].content
                hash = githubResponse.history[0].version

                callback(null,
                    code: code
                    hash: hash
                )
            else
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

    createRobotRevisionFight: (fight, robotRevision, callback) ->
        robotRevisionFight = RobotRevisionFight.build(
            robot_revision_id: robotRevision.id
            fight_id: fight.id
            position: 0
            shots_fired: 0
            shots_hit: 0
            enemies_killed: 0
            position_x: 0
            position_y: 0
            angle: 0
        )

        robotRevision.save().success(->
            callback(null, robotRevisionFight)
        )

    runFight: (player, opponent) ->
        return null

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
                      name: "player"
                      code: self.playerGist.code
                  }, {
                      name: "opponent"
                      code: self.opponentGist.code
                  })

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
                  self.findOrCreateRobotRevision(self.playerRobot, gist, callback)
            , (robotRevision, callback) ->
                  self.playerRobotRevision = robotRevision
                  self.createRobotRevisionFight(self.fight, robotRevision, callback)
            , (robotRevisionFight, callback) ->
                  self.playerRobotRevisionFight = robotRevisionFight
                  self.findRobot(self.opponentRobotId, callback)
            , (robot, callback) ->
                  self.opponentRobot = robot
                  self.findOrCreateRobotRevision(self.opponentRobot, gist, callback)
            , (robotRevision, callback) ->
                  self.opponentRobotRevision = robotRevision
                  self.createRobotRevisionFight(self.fight, robotRevision, callback)
            , (robotRevisionFight, callback) ->
                  self.opponentRobotRevisionFight = robotRevisionFight
                  callback(null,
                      fight: self.fight
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

    repository.createFight((result) ->
        if result is 404
            res.send(404)
        else
            res.redirect("/robots/replay/#{ result.fight.id }")
    )
