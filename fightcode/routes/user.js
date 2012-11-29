/*
 * GET users listing.
 */

var path = require('path'),
    sequelize = require(path.join(process.env.CWD, 'fightcode', 'config', 'database')),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    User = sequelize.import(path.join(modelsPath, 'user')),
    Util = require(path.join(process.env.CWD, 'fightcode', 'helpers', 'util'));

function renderProfile(res, userLogin) {

    User.find({where: {login: userLogin}})
        .success(function(user) {
            user.rankedRobots(function(robots){
                user.robotsStatistics(function(statistcs){
                    var parsedStatistcs = Util.mapStatistcs(statistcs);
                    return res.render('user', {
                        title: user.name,
                        user: user,
                        statistcs: parsedStatistcs,
                        robots: robots
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
