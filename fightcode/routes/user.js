/*
 * GET users listing.
 */

var path = require('path'),
    sequelize = require(path.join(process.env.CWD, 'fightcode', 'config', 'database')),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    User = sequelize.import(path.join(modelsPath, 'user')),
    Robot = sequelize.import(path.join(modelsPath, 'robot')),
    RobotScoreHistory = sequelize.import(path.join(modelsPath, 'robotScoreHistory')),
    Util = require(path.join(process.env.CWD, 'fightcode', 'helpers', 'util'));

exports.myProfile = function(req, res){
    res.redirect("/profile/" + req.user.login);
};

exports.show = function(req, res) {
    var userLogin = req.params[0];

    User.find({where: {login: userLogin}})
        .success(function(user) {
            user.rankedRobots(function(robots){
                RobotScoreHistory.histories(robots.map(function(r) { return r.id; }), function(histories) {
                    Robot.lastFights(function(lastFights){
                        user.robotsStatistics(function(statistcs){
                            var parsedStatistcs = Util.mapStatistcs(statistcs);
                            return res.render('user', {
                                title: user.name,
                                user: user,
                                isOwner: req.user.id === user.id,
                                statistcs: parsedStatistcs,
                                robots: robots,
                                lastFights: lastFights,
                                histories: histories
                            });
                        });
                    });
                });
            });
        });
};
