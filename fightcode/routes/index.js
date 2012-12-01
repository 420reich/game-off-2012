var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');

var sequelize = require(path.join(basePath, 'config', 'database'));
var Robot = sequelize.import(path.join(basePath, 'models', 'robot'));

exports.index = function(req, res){
    Robot.timelineFights(function(fights) {
        Robot.count().success(function(count) {
            User.count().success(function(userCount) {
                Robot.getLeader(function(leader) {
                    res.render('index', {
                        title: 'Killing Robots for Fun',
                        fights: fights,
                        robotCount: count,
                        userCount: userCount,
                        leaderRobot: leader
                    });
                });
            });
        });
    });
};
