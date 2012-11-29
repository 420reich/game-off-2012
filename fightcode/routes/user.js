/*
 * GET users listing.
 */

var path = require('path'),
    sequelize = require(path.join(process.env.CWD, 'fightcode', 'config', 'database')),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    User = sequelize.import(path.join(modelsPath, 'user'));

function mapStatistcs(list) {
    var statistcs = {};

    for (var i=0; i < list.length; i++){
        var id = list[i]['id'];
        delete list[i]['id'];

        if (!!list[i]['shots_hit']) {
            list[i].hitsPercentage = (list[i]['shots_fired'] * 100) / list[i]['shots_hit'];
        } else {
            list[i].hitsPercentage = 0;
        }
        statistcs[id] = list[i];
    }
    return statistcs;
}

function renderProfile(res, userLogin) {

    User.find({where: {login: userLogin}})
        .success(function(user) {
            user.rankedRobots(function(robots){
                user.robotsStatistics(function(statistcs){
                    var parsedStatistcs = mapStatistcs(statistcs);
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
