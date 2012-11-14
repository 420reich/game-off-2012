path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

User = sequelize.import(path.join(basePath, 'models', 'user'))
GithubApi = require 'github'


exports.showPage = (req, res) ->
    return res.redirect '/auth/github' if !req.loggedIn
    res.render 'createRobot', title: 'Create My Robot!'


exports.createAction = (req, res) ->
    return res.redirect '/auth/github' if !req.loggedIn

    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    robotData =
        description: req.param('title'),
        public: req.param('public') == 'yes',
        files:
            'robot.js':
                'content': req.param('code')

    github.gists.create robotData, (err, res) ->
        console.log err
