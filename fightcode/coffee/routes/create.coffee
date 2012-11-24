path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

Robot = sequelize.import(path.join(basePath, 'models', 'robot'))
GithubApi = require 'github'

exports.createView = (req, res) ->
    res.render 'createRobot',
                title: 'Create My Robot!',
                public: true


exports.create = (req, res) ->

    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    robotData =
        description: req.param('title'),
        public: !!req.param('public'),
        files:
            'robot.js':
                'content': req.param('code')

    github.gists.create robotData, (err, githubResponse) ->
        robot = Robot.build (
            ownerLogin: req.user.login,
            gist: githubResponse.id,
            isPublic: !!req.param('public'),
            title: req.param('title')
        )
        req.user.addRobot(robot)
            .success( ->
                res.redirect '/robots/update/' + robot.gist
            )


exports.updateView = (req, res) ->

    gistId = req.params[0]
    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    req.user.getRobots(where: gist: gistId).success (robots) ->
        if robots.length == 1
            robot = robots[0]
            github.gists.get id: gistId, (err, githubResponse) ->
                    files = Object.keys githubResponse.files
                    res.render('createRobot',
                        title: 'Update my robot',
                        public: githubResponse.public,
                        update: true,
                        roboCode: encodeURI(githubResponse.files[files[0]].content),
                        robotTitle: robot.title
                    )
        else
            res.redirect '/'


exports.update = (req, res) ->

    gistId = req.params[0]
    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    robotData =
        id: gistId,
        description: req.param('title'),
        files:
            'robot.js':
                'content': req.param('code')

    req.user.getRobots(where: gist: gistId).success (robots) ->
        if robots.length == 1
            robot = robots[0]
            robot.title = req.param('title')
            robot.save(['title']).success( ->
                github.gists.edit robotData, (err, githubResponse) ->
                        res.redirect '/robots/update/' + robot.gist
            )
        else
            res.redirect '/'


