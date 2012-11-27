var Fight, FightRepository, GithubApi, Robot, RobotRevision, RobotRevisionFight, async, basePath, path, sequelize;

path = require('path');

async = require('async');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Fight = sequelize["import"](path.join(basePath, 'models', 'fight'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

RobotRevision = sequelize["import"](path.join(basePath, 'models', 'robotRevision'));

RobotRevisionFight = sequelize["import"](path.join(basePath, 'models', 'robotRevisionFight'));

GithubApi = require('github');

FightRepository = (function() {

  function FightRepository(playerRobotId, opponentRobotId, userToken) {
    this.playerRobotId = playerRobotId;
    this.opponentRobotId = opponentRobotId;
    this.userToken = userToken;
  }

  FightRepository.prototype.findRobot = function(gistId, callback) {
    return Robot.find({
      where: {
        gist: gistId
      }
    }).success(function(robot) {
      if (robot) {
        return callback(null, robot);
      } else {
        return callback(404);
      }
    });
  };

  FightRepository.prototype.findLastGist = function(gistId, callback) {
    var github;
    github = new GithubApi({
      version: '3.0.0'
    });
    github.authenticate({
      type: 'oauth',
      token: this.userToken
    });
    return github.gists.get({
      id: gistId
    }, function(err, githubResponse) {
      var code, hash;
      if (!err) {
        code = githubResponse.files['robot.js'].content;
        hash = githubResponse.history[0].version;
        return callback(null, {
          code: code,
          hash: hash
        });
      } else {
        return callback(404);
      }
    });
  };

  FightRepository.prototype.findOrCreateRobotRevision = function(robot, gist, callback) {
    return RobotRevision.find({
      where: {
        robot_id: robot.id,
        gist_hash: gist.hash
      }
    }).success(function(robotRevision) {
      if (!robotRevision) {
        robotRevision = RobotRevision.build({
          robot_id: robot.id,
          gist_hash: gist.hash,
          code: gist.code
        });
      }
      return robotRevision.save().success(function() {
        return callback(null, robotRevision);
      });
    });
  };

  FightRepository.prototype.createRobotRevisionFight = function(fight, robotRevision, callback) {
    var robotRevisionFight;
    robotRevisionFight = RobotRevisionFight.build({
      robot_revision_id: robotRevision.id,
      fight_id: fight.id,
      position: 0,
      shots_fired: 0,
      shots_hit: 0,
      enemies_killed: 0,
      position_x: 0,
      position_y: 0,
      angle: 0
    });
    return robotRevision.save().success(function() {
      return callback(null, robotRevisionFight);
    });
  };

  FightRepository.prototype.runFight = function(player, opponent) {
    return null;
  };

  FightRepository.prototype.createFight = function(createFightCallback) {
    var self;
    self = this;
    return async.waterfall([
      function(callback) {
        return self.findLastGist(self.playerRobotId, callback);
      }, function(gist, callback) {
        self.playerGist = gist;
        return self.findLastGist(self.opponentRobotId, callback);
      }, function(gist, callback) {
        var fight, result;
        self.opponentGist = gist;
        result = self.runFight({
          name: "player",
          code: self.playerGist.code
        }, {
          name: "opponent",
          code: self.opponentGist.code
        });
        fight = Fight.build({
          randomSeed: Math.random()
        });
        return fight.save().success(function() {
          return callback(null, fight);
        });
      }, function(fight, callback) {
        self.fight = fight;
        return self.findRobot(self.playerRobotId, callback);
      }, function(robot, callback) {
        self.playerRobot = robot;
        return self.findOrCreateRobotRevision(self.playerRobot, gist, callback);
      }, function(robotRevision, callback) {
        self.playerRobotRevision = robotRevision;
        return self.createRobotRevisionFight(self.fight, robotRevision, callback);
      }, function(robotRevisionFight, callback) {
        self.playerRobotRevisionFight = robotRevisionFight;
        return self.findRobot(self.opponentRobotId, callback);
      }, function(robot, callback) {
        self.opponentRobot = robot;
        return self.findOrCreateRobotRevision(self.opponentRobot, gist, callback);
      }, function(robotRevision, callback) {
        self.opponentRobotRevision = robotRevision;
        return self.createRobotRevisionFight(self.fight, robotRevision, callback);
      }, function(robotRevisionFight, callback) {
        self.opponentRobotRevisionFight = robotRevisionFight;
        return callback(null, {
          fight: self.fight,
          player: self.playerRobotRevision,
          opponent: self.opponentRobotRevision
        });
      }
    ], function(err, result) {
      if (err) {
        createFightCallback(404);
      }
      if (!err) {
        return createFightCallback(result);
      }
    });
  };

  return FightRepository;

})();

exports.startFight = function(req, res) {
  var myRobot, otherRobotId;
  myRobot = req.params[1];
  otherRobotId = req.params[2];
  return res.render('fightRobot', {
    title: 'Fight Another Robot'
  });
};

exports.createFight = function(req, res) {
  var opponentRobotId, playerRobotId, repository;
  playerRobotId = req.params.robot_id;
  opponentRobotId = req.params.opponent_id;
  repository = new FightRepository(playerRobotId, opponentRobotId, req.user.token);
  return repository.createFight(function(result) {
    if (result === 404) {
      return res.send(404);
    } else {
      return res.redirect("/robots/replay/" + result.fight.id);
    }
  });
};
