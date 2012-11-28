var Fight, FightRepository, GithubApi, Robot, RobotRevision, RobotRevisionFight, async, basePath, enginePath, fs, path, sequelize, vm;

path = require('path');

fs = require('fs');

async = require('async');

basePath = path.join(process.env.CWD, 'fightcode');

vm = require('vm');

enginePath = path.join(basePath, 'static', 'output', 'fightcode.engine.min.js');

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
        console.log("robot with gist " + gistId + " not found!");
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
        console.log("gist " + gistId + " not found!");
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

  FightRepository.prototype.createRobotRevisionFight = function(fight, robotRevision, engineRobot, robotPosition, callback) {
    var robotRevisionFight;
    robotRevisionFight = RobotRevisionFight.build({
      fight_id: fight.id,
      robot_revision_id: robotRevision.id,
      position: robotPosition,
      shots_fired: engineRobot.stats.bulletsFired,
      shots_hit: engineRobot.stats.bulletsHit,
      enemies_killed: engineRobot.stats.enemiesKilled,
      position_x: engineRobot.robot.rectangle.position.x,
      position_y: engineRobot.robot.rectangle.position.y,
      angle: engineRobot.robot.rectangle.angle
    });
    return robotRevisionFight.save().success(function() {
      return callback(null, robotRevisionFight);
    });
  };

  FightRepository.prototype.runFight = function(player, opponent, callback) {
    return fs.readFile(enginePath, 'utf8', function(err, data) {
      var engineContext, init, initContext, opponentContext, opponentRobot, playerContext, playerRobot;
      init = "                maxRounds = 10000;                boardSize = {                    width: 800,                    height: 500                };                playerRobotInstance = player.Robot;                opponentRobotInstance = opponent.Robot;                player.constructor = playerRobotInstance;                opponent.constructor = opponentRobotInstance;                engineInstance = new engine.Engine(boardSize.width, boardSize.height, maxRounds, Math.random, console.log, player, opponent);                result = engineInstance.fight();            ";
      playerContext = {};
      vm.runInNewContext(player.code.replace("var Robot", "Robot"), playerContext);
      playerRobot = playerContext.Robot;
      opponentContext = {};
      vm.runInNewContext(opponent.code.replace("var Robot", "Robot"), opponentContext);
      opponentRobot = opponentContext.Robot;
      engineContext = {};
      vm.runInNewContext(data, engineContext);
      initContext = {
        console: {
          log: function(message) {}
        },
        engine: engineContext,
        player: {
          name: player.name,
          Robot: playerRobot
        },
        opponent: {
          name: opponent.name,
          Robot: opponentRobot
        }
      };
      console.log('running the fight...');
      vm.runInNewContext(init, initContext);
      console.log('fight calculated successfully.');
      return callback(null, initContext.result);
    });
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
        var result;
        self.opponentGist = gist;
        return result = self.runFight({
          name: "player",
          code: self.playerGist.code
        }, {
          name: "opponent",
          code: self.opponentGist.code
        }, callback);
      }, function(result, callback) {
        var fight;
        self.fightResult = result;
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
        return self.findOrCreateRobotRevision(self.playerRobot, self.playerGist, callback);
      }, function(robotRevision, callback) {
        var robotIdx, robotPosition, robotResult, _i, _ref;
        self.playerRobotRevision = robotRevision;
        robotResult = null;
        robotPosition = 0;
        for (robotIdx = _i = 0, _ref = self.fightResult.robots.length; 0 <= _ref ? _i <= _ref : _i >= _ref; robotIdx = 0 <= _ref ? ++_i : --_i) {
          robotResult = self.fightResult.robots[robotIdx];
          robotPosition = robotIdx + 1;
          if (robotResult.robot.name === 'player') {
            break;
          }
        }
        if (robotResult === null) {
          return callback(404);
        } else {
          return self.createRobotRevisionFight(self.fight, robotRevision, robotResult, robotPosition, callback);
        }
      }, function(robotRevisionFight, callback) {
        self.playerRobotRevisionFight = robotRevisionFight;
        return self.findRobot(self.opponentRobotId, callback);
      }, function(robot, callback) {
        self.opponentRobot = robot;
        return self.findOrCreateRobotRevision(self.opponentRobot, self.opponentGist, callback);
      }, function(robotRevision, callback) {
        var robotIdx, robotPosition, robotResult, _i, _ref;
        self.opponentRobotRevision = robotRevision;
        robotResult = null;
        robotPosition = 0;
        for (robotIdx = _i = 0, _ref = self.fightResult.robots.length; 0 <= _ref ? _i <= _ref : _i >= _ref; robotIdx = 0 <= _ref ? ++_i : --_i) {
          robotResult = self.fightResult.robots[robotIdx];
          robotPosition = robotIdx + 1;
          if (robotResult.robot.name === 'opponent') {
            break;
          }
        }
        if (robotResult === null) {
          return callback(404);
        } else {
          return self.createRobotRevisionFight(self.fight, robotRevision, robotResult, robotPosition, callback);
        }
      }, function(robotRevisionFight, callback) {
        self.opponentRobotRevisionFight = robotRevisionFight;
        return callback(null, {
          fight: self.fight,
          result: self.fightResult,
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

exports.replayFight = function(req, res) {
  var fightId;
  fightId = req.params.fight_id;
  return RobotRevisionFight.findAll({
    where: {
      fight_id: fightId
    }
  }).success(function(robotRevisionFights) {
    var revisionFunctions, robotRevisionFight, _fn, _i, _len;
    revisionFunctions = [];
    _fn = function(robotRevisionFight) {
      return revisionFunctions.push(function(callback) {
        return RobotRevision.find(robotRevisionFight.robot_revision_id).success(function(revision) {
          return (function(revision) {
            robotRevisionFight.code = revision.code;
            return Robot.find(revision.robot_id).success(function(robot) {
              robotRevisionFight.gistId = robot.gist;
              robotRevisionFight.name = robot.title;
              return callback(null, revision, robot);
            });
          })(revision);
        });
      });
    };
    for (_i = 0, _len = robotRevisionFights.length; _i < _len; _i++) {
      robotRevisionFight = robotRevisionFights[_i];
      _fn(robotRevisionFight);
    }
    return async.parallel(revisionFunctions, function(results) {
      return res.render('fightRobot', {
        revisions: robotRevisionFights,
        title: "Fight Replay #" + fightId
      });
    });
  });
};

exports.prepareFight = function(req, res) {
  return Robot.find({
    where: {
      id: req.params.robot_id
    }
  }).success(function(opponent) {
    return req.user.getRobots().success(function(myRobots) {
      return res.render('prepareFight', {
        layout: false,
        opponent: opponent,
        myRobots: myRobots
      });
    });
  });
};
