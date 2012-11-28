var Robot, basePath, path, reduceRank, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

reduceRank = function(rank, robotId) {
  var center, i, robot, _i, _len;
  for (i = _i = 0, _len = rank.length; _i < _len; i = ++_i) {
    robot = rank[i];
    if (robot.id === robotId) {
      center = i;
      break;
    }
  }
  return rank.slice(center - 3, center + 4);
};

exports.index = function(req, res) {
  return req.user.getRobots().success(function(robots) {
    var robot, robotRank, size, _fn, _i, _len;
    if (robots.length > 0) {
      size = robots.length;
      robotRank = [];
      _fn = function(robot) {
        return robot.rankNear(function(rank) {
          var reducedRank;
          reducedRank = reduceRank(rank, robot.id);
          robotRank.push({
            robot: robot,
            rank: reducedRank
          });
          if (robotRank.length === size) {
            return robot.top10(function(top10) {
              return res.render('ranking', {
                robotRank: robotRank,
                top10: top10,
                title: 'The Amazing Robot League'
              });
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
