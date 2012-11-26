var GithubApi, Robot, basePath, path, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

GithubApi = require('github');

exports.startFight = function(req, res) {
  var myRobot, otherRobotId;
  myRobot = req.params[1];
  otherRobotId = req.params[2];
  return res.render('fightRobot', {
    title: 'Fight Another Robot'
  });
};

exports.createFight = function(req, res) {
  var myRobotId, opponentRobotId;
  myRobotId = req.params.robot_id;
  opponentRobotId = req.params.opponent_id;
  return Robot.find({
    where: {
      id: myRobotId
    }
  }).success(function(myRobot) {
    return Robot.find({
      where: {
        id: myRobotId
      }
    }).success(function(opponentRobot) {
      return res.redirect('/');
    });
  });
};
