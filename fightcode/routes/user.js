/*
 * GET users listing.
 */

var path = require('path'),
    sequelize = require(path.join(process.env.CWD, 'fightcode', 'config', 'database')),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    User = sequelize.import(path.join(modelsPath, 'user')),
    Robot = sequelize.import(path.join(modelsPath, 'robot')),
    Util = require(path.join(process.env.CWD, 'fightcode', 'helpers', 'util'));

function renderProfile(res, userLogin) {

    User.find({where: {login: userLogin}})
        .success(function(user) {
            user.rankedRobots(function(robots){
                Robot.lastFights(function(lastFights){
                    user.robotsStatistics(function(statistcs){
                        var parsedStatistcs = Util.mapStatistcs(statistcs);
                        return res.render('user', {
                            title: user.name,
                            user: user,
                            statistcs: parsedStatistcs,
                            robots: robots,
                            lastFights: lastFights
                        });
                    });
                });
            });
        });
}

exports.myProfile = function(req, res){
    res.redirect("/profile/" + req.user.login);
};

exports.show = function(req, res) {
    renderProfile(res, req.params[0]);
};
