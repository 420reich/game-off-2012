var GithubApi, Robot, basePath, path, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

GithubApi = require('github');

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
      title: req.param('title'),
      color: req.param('robot-color'),
      linesOfCode: req.param('code').split('\n').length
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
    if (!(robots.length > 0)) {
      return res.redirect('/');
    }
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
        robotCode: encodeURI(githubResponse.files[files[0]].content),
        robotTitle: robot.title,
        robotColor: robot.color
      });
    });
  });
};

exports.update = function(req, res) {
  var code, color, gistId, github, robotData, title;
  gistId = req.params.robot_id;
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  title = req.param('title');
  code = req.param('code');
  color = req.param('robot-color');
  robotData = {
    id: gistId,
    description: title,
    files: {
      'robot.js': {
        'content': code
      }
    }
  };
  return req.user.getRobots({
    where: {
      gist: gistId
    }
  }).success(function(robots) {
    var robot;
    if (!(robots.length > 0)) {
      return res.redirect('/');
    }
    robot = robots[0];
    robot.title = title;
    robot.color = color;
    robot.linesOfCode = code.split('\n').length;
    return robot.save().success(function() {
      return github.gists.edit(robotData, function(err, githubResponse) {
        return res.redirect('/robots/update/' + robot.gist);
      });
    });
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
