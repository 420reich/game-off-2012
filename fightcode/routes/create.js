var GithubApi, Robot, User, basePath, path, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

GithubApi = require('github');

User = sequelize["import"](path.join(basePath, 'models', 'user'));

User.findAll().success(function(users) {
  var i, robot, user, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = users.length; _i < _len; _i++) {
    user = users[_i];
    _results.push((function() {
      var _j, _results1;
      _results1 = [];
      for (i = _j = 0; _j <= 10; i = ++_j) {
        _results1.push(robot = Robot.build({
          ownerLogin: user.login,
          gist: i + 100,
          isPublic: true,
          title: "Mussum do Futuro " + i
        }));
      }
      return _results1;
    })());
  }
  return _results;
});

exports.createView = function(req, res) {
  return res.render('createRobot', {
    title: 'Create My Robot!',
    "public": true
  });
};

exports.create = function(req, res) {
  var github, robotData;
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  robotData = {
    description: req.param('title'),
    "public": !!req.param('public'),
    files: {
      'robot.js': {
        'content': req.param('code')
      }
    }
  };
  return github.gists.create(robotData, function(err, githubResponse) {
    var robot;
    robot = Robot.build({
      ownerLogin: req.user.login,
      gist: githubResponse.id,
      isPublic: !!req.param('public'),
      title: req.param('title')
    });
    return req.user.addRobot(robot).success(function() {
      return res.redirect('/robots/update/' + robot.gist);
    });
  });
};

exports.updateView = function(req, res) {
  var gistId, github;
  gistId = req.params.robot_id;
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  return req.user.getRobots({
    where: {
      gist: gistId
    }
  }).success(function(robots) {
    var robot;
    if (robots.length === 1) {
      robot = robots[0];
      return github.gists.get({
        id: gistId
      }, function(err, githubResponse) {
        var files;
        files = Object.keys(githubResponse.files);
        return res.render('createRobot', {
          title: 'Update my robot',
          "public": githubResponse["public"],
          update: true,
          roboCode: encodeURI(githubResponse.files[files[0]].content),
          robotTitle: robot.title
        });
      });
    } else {
      return res.redirect('/');
    }
  });
};

exports.update = function(req, res) {
  var gistId, github, robotData;
  gistId = req.params.robot_id;
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  robotData = {
    id: gistId,
    description: req.param('title'),
    files: {
      'robot.js': {
        'content': req.param('code')
      }
    }
  };
  return req.user.getRobots({
    where: {
      gist: gistId
    }
  }).success(function(robots) {
    var robot;
    if (robots.length === 1) {
      robot = robots[0];
      robot.title = req.param('title');
      return robot.save(['title']).success(function() {
        return github.gists.edit(robotData, function(err, githubResponse) {
          return res.redirect('/robots/update/' + robot.gist);
        });
      });
    } else {
      return res.redirect('/');
    }
  });
};

exports.fork = function(req, res) {
  var gistId, github;
  gistId = req.params.robot_id;
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  return Robot.find({
    where: {
      gist: gistId
    }
  }).success(function(robot) {
    if (robot.is_public && !(robot.user_id === req.user.id)) {
      return github.gists.fork({
        id: gistId
      }, function(err, githubResponse) {
        var robotFork;
        robotFork = Robot.build({
          ownerLogin: req.user.login,
          gist: githubResponse.id,
          isPublic: githubResponse["public"],
          title: githubResponse.description
        });
        return req.user.addRobot(robotFork).success(function() {
          return res.redirect('/robots/update/' + robotFork.gist);
        });
      });
    } else {
      return res.redirect('/');
    }
  });
};
