var GithubApi, Robot, basePath, path, sequelize;

path = require('path');

basePath = path.join(process.env.CWD, 'fightcode');

sequelize = require(path.join(basePath, 'config', 'database'));

Robot = sequelize["import"](path.join(basePath, 'models', 'robot'));

GithubApi = require('github');

exports.createView = function(req, res) {
  return res.render('createRobot', {
    title: 'Create My Robot!',
    'roboCode': '',
    robotTitle: ''
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
    "public": 'true',
    files: {
      'robot.js': {
        'content': req.param('code')
      }
    }
  };
  return github.gists.create(robotData, function(err, githubResponse) {
    return Robot.create({
      ownerLogin: req.user.login,
      gists: githubResponse.id,
      isPublic: true,
      title: req.param('title')
    }).success(function(robot) {
      return res.redirect('/robots/update/' + robot.gists);
    });
  });
};

exports.updateView = function(req, res) {
  var gistsId, github;
  gistsId = req.params[0];
  github = new GithubApi({
    version: '3.0.0'
  });
  github.authenticate({
    type: 'oauth',
    token: req.user.token
  });
  return Robot.find({
    where: {
      gists: gistsId
    }
  }).success(function(robot) {
    if (!robot) {
      return Robot.create({
        ownerLogin: req.user.login,
        gists: gistsId,
        isPublic: true,
        title: 'No title'
      }).success(function(robot) {
        return github.gists.get({
          id: gistsId
        }, function(err, githubResponse) {
          var files;
          files = Object.keys(githubResponse.files);
          return res.render('createRobot', {
            title: 'Update my robot',
            roboCode: encodeURI(githubResponse.files[files[0]].content),
            robotTitle: robot.title
          });
        });
      });
    } else {
      return github.gists.get({
        id: gistsId
      }, function(err, githubResponse) {
        var files;
        files = Object.keys(githubResponse.files);
        return res.render('createRobot', {
          title: 'Update my robot',
          roboCode: encodeURI(githubResponse.files[files[0]].content),
          robotTitle: robot.title
        });
      });
    }
  });
};

exports.update = function(req, res) {};
