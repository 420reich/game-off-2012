path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

Robot = sequelize.import(path.join(basePath, 'models', 'robot'))
GithubApi = require 'github'

exports.startFight = (req, res) ->
    myRobot = req.params[1]
    otherRobotId = req.params[2]

    res.render 'fightRobot', title: 'Fight Another Robot'

exports.createFight = (req, res) ->
    myRobotId = req.params.robot_id
    opponentRobotId = req.params.opponent_id

    Robot.find({ where: {id: myRobotId }}).success((myRobot) ->
        Robot.find({ where: {id: myRobotId }}).success((opponentRobot) ->
            res.redirect('/')
        )
    )

