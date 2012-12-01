var Fight, FightRepository, GithubApi, Robot, RobotRevision, RobotRevisionFight, User, async, basePath, enginePath, fs, path, sequelize, vm;

path = require('path');

fs = require('fs');

async = require('async');

basePath = path.join(process.env.CWD, 'fightcode');

vm = require('vm');

enginePath = path.join(basePath, 'static', 'output', 'fightcode.engine.min.js');

sequelize = require(path.join(basePath, 'config', 'database'));

User = sequelize["import"](path.join(basePath, 'models', 'user'));

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
      console.dir(githubResponse);
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
    var createContext;
    createContext = function() {
      return {
        console: {
          log: function() {}
        }
      };
    };
    return fs.readFile(enginePath, 'utf8', function(err, data) {
      var basicContext, engineContext, init, initContext, opponentContext, opponentRobot, playerContext, playerRobot;
      init = "maxRounds = 10000;\nboardSize = {\n    width: 800,\n    height: 500\n};\n\nplayerRobotInstance = player.Robot;\nopponentRobotInstance = opponent.Robot;\n\nplayer.constructor = playerRobotInstance;\nopponent.constructor = opponentRobotInstance;\n\nengineInstance = new engine.Engine(boardSize.width, boardSize.height, maxRounds, Math.random, player, opponent);\nresult = engineInstance.fight();";
      playerContext = createContext();
      vm.runInNewContext(player.code.replace("var Robot", "Robot"), playerContext);
      playerRobot = playerContext.Robot;
      opponentContext = createContext();
      vm.runInNewContext(opponent.code.replace("var Robot", "Robot"), opponentContext);
      opponentRobot = opponentContext.Robot;
      engineContext = createContext();
      vm.runInNewContext(data, engineContext);
      basicContext = createContext();
      initContext = {
        console: basicContext.console,
        engine: engineContext,
        player: {
          name: player.name,
          gist: player.gist,
          Robot: playerRobot
        },
        opponent: {
          name: opponent.name,
          gist: opponent.gist,
          Robot: opponentRobot
        }
      };
      console.log('running the fight...');
      vm.runInNewContext(init, initContext);
      console.log('fight calculated successfully.');
      return callback(null, initContext.result);
    });
  };

  FightRepository.prototype.computeResults = function(playerRobot, opponentRobot, fightResults, callback) {
    var percentage;
    if (fightResults.isDraw) {
      playerRobot.addDraw();
      return playerRobot.updateScore(playerRobot.score + 1, function() {
        opponentRobot.addDraw();
        return opponentRobot.updateScore(opponentRobot.score + 1, function() {
          return callback(null, opponentRobot);
        });
      });
    } else if (fightResults.robots[0].robot.gist === playerRobot.gist) {
      percentage = Math.min(3.0, opponentRobot.score / playerRobot.score);
      playerRobot.addVictory();
      return playerRobot.updateScore(playerRobot.score + (percentage * 3), function() {
        opponentRobot.addDefeat();
        return opponentRobot.updateScore(opponentRobot.score - 1, function() {
          return callback(null, opponentRobot);
        });
      });
    } else {
      percentage = Math.min(3.0, playerRobot.score / opponentRobot.score);
      opponentRobot.addVictory();
      return opponentRobot.updateScore(opponentRobot.score + (percentage * 3), function() {
        playerRobot.addDefeat();
        return playerRobot.updateScore(playerRobot.score - 1, function() {
          return callback(null, opponentRobot);
        });
      });
    }
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
          gist: self.playerRobotId,
          name: "player",
          code: self.playerGist.code
        }, {
          gist: self.opponentRobotId,
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
        return self.computeResults(self.playerRobot, robot, self.fightResult, callback);
      }, function(robot, callback) {
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
  return repository.findRobot(playerRobotId, function(err, robot) {
    return robot.getLastFightDate(function(date) {
      var diff;
      diff = Math.abs(new Date() - date);
      if (diff < 60000) {
        return res.redirect("/robots/timeout/" + robot.id);
      } else {
        return repository.createFight(function(result) {
          if (result === 404) {
            return res.send(404);
          } else {
            return res.redirect("/robots/replay/" + result.fight.id);
          }
        });
      }
    });
  });
};

exports.fightTest = function(req, res) {
  return res.render('fightTest', {
    title: "Fight Test"
  });
};

exports.randomFight = function(req, res) {
  var playerRobotId;
  playerRobotId = req.params.robot_id;
  return Robot.findRandomRobotGist(playerRobotId, function(opponentRobotId) {
    return res.redirect("/robots/fight/" + playerRobotId + "/" + opponentRobotId);
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
              return (function(robot) {
                robotRevisionFight.gistId = robot.gist;
                robotRevisionFight.name = robot.title;
                robotRevisionFight.color = robot.color;
                return User.find({
                  where: {
                    id: robot.user_id
                  }
                }).success(function(user) {
                  robotRevisionFight.user = user;
                  return callback(null, revision, robot);
                });
              })(robot);
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

exports.timeoutView = function(req, res) {
  return Robot.find({
    where: {
      id: req.params.robot_id
    }
  }).success(function(robot) {
    var title;
    title = robot.title;
    console.log(title);
    return (function(robot) {
      return robot.getLastFightDate(function(date) {
        var diff;
        diff = Math.abs(new Date() - date) / 1000;
        if (diff > 60) {
          return res.redirect('/');
        } else {
          return res.render('timeout', {
            title: title,
            seconds: 60 - Math.floor(diff)
          });
        }
      });
    })(robot);
  });
};
