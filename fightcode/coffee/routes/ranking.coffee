path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

Robot = sequelize.import(path.join(basePath, 'models', 'robot'))

exports.index = (req, res) ->
    Robot.findAll(where: {ownerLogin: req.user.login}).success((robots) ->
        if (robots.length > 0)
            size = robots.length
            robotRank = []
            for robot in robots
                do (robot) ->
                    robot.rankNear((rank) ->
                        robotRank.push({robot: robot, rank: rank})
                        if (robotRank.length == size)
                            res.render('ranking',
                                robotRank: robotRank,
                                title: 'The Amazing Robot League')
                    )
            return null
        else
            res.render('ranking',
                            robotRank: [],
                            title: 'The Amazing Robot League')
    )
