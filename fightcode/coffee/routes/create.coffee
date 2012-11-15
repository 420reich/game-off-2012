path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

User = sequelize.import(path.join(basePath, 'models', 'user'))
GithubApi = require 'github'


exports.showPage = (req, res) ->
    return res.redirect '/auth/github' if !req.loggedIn
    res.render 'createRobot', title: 'Create My Robot!', 'roboCode': ''


exports.create = (req, res) ->
    return res.redirect '/auth/github' if !req.loggedIn

    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    robotData =
        description: req.param('title'),
        public: 'true',
        files:
            'robot.js':
                'content': req.param('code')

    github.gists.create robotData, (err, githubResponse) ->
        res.redirect '/robots/update/' + githubResponse.id


exports.update = (req, res) ->
    return res.redirect '/auth/github' if !req.loggedIn

    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    github.gists.get id: req.params[0], (err, githubResponse) ->
        files = Object.keys githubResponse.files
        res.render 'createRobot', title: 'Update my robot', 'roboCode': encodeURI(githubResponse.files[files[0]].content)
