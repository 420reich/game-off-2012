path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

Robot = sequelize.import(path.join(basePath, 'models', 'robot'))

exports.index = (req, res) ->
    req.user.getRobots().success((robots) ->
        Robot.top10((top10) ->
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
                                top10: top10,
                                title: 'The Amazing Robot League')
                        )
                return null
            else
                res.render('ranking',
                                robotRank: [],
                                top10: top10,
                                title: 'The Amazing Robot League')
        )
    )
