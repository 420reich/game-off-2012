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
        var id = list['id'];
        delete list['id'];

        if (!!list['shots_hit']) {
            list.hitsPercentage = (list['shots_fired'] * 100) / list['shots_hit'];
        } else {
            list.hitsPercentage = 0;
        }
        statistcs[id] = list;
    }
    return statistcs;
}

function renderProfile(res, userLogin) {

    User.find({where: {login: userLogin}})
        .success(function(user) {
            user.rankedRobots(function(robots){
                user.robotsStatistics(function(statistcs){
                    var parsedStatistcs = mapStatistcs(statistcs);
                    console.log(parsedStatistcs);
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
