var Robot, basePath, path, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

exports.index = function(req, res) {
  return Robot.findAll({
    where: {
      ownerLogin: req.user.login
    }
  }).success(function(robots) {
    var robot, robotRank, size, _fn, _i, _len;
    if (robots.length > 0) {
      size = robots.length;
      robotRank = [];
      _fn = function(robot) {
        return robot.rankNear(function(rank) {
          robotRank.push({
            robot: robot,
            rank: rank
          });
          if (robotRank.length === size) {
            return res.render('ranking', {
              robotRank: robotRank,
              title: 'The Amazing Robot League'
            });
          }
        });
      };
      for (_i = 0, _len = robots.length; _i < _len; _i++) {
        robot = robots[_i];
        _fn(robot);
      }
      return null;
    } else {
      return res.render('ranking', {
        robotRank: [],
        title: 'The Amazing Robot League'
      });
    }
  });
};
