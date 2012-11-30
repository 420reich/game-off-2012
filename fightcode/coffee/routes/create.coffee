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
            title: req.param('title'),
            color: req.param('robot-color')
            linesOfCode: req.param('code').split('\n').length
        )
        req.user.addRobot(robot)
            .success( ->
                res.redirect '/robots/update/' + robot.gist
            )


exports.updateView = (req, res) ->

    gistId = req.params.robot_id
    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    req.user.getRobots(where: gist: gistId).success((robots) ->
        return res.redirect('/') unless robots.length > 0
        robot = robots[0]
        github.gists.get(id: gistId, (err, githubResponse) ->
            files = Object.keys githubResponse.files
            res.render('createRobot',
                title: 'Update my robot',
                public: githubResponse.public,
                update: true,
                robotCode: encodeURI(githubResponse.files[files[0]].content),
                robotTitle: robot.title
                robotColor: robot.color
            )
        )
    )

exports.update = (req, res) ->
    gistId = req.params.robot_id
    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token
    title = req.param('title')
    code = req.param('code')
    color = req.param('robot-color')

    robotData =
        id: gistId,
        description: title
        files:
            'robot.js':
                'content': code

    req.user.getRobots(where: gist: gistId).success((robots) ->
        return res.redirect('/') unless robots.length > 0
        robot = robots[0]
        robot.title = title
        robot.color = color
        robot.linesOfCode = code.split('\n').length
        robot.save().success( ->
            github.gists.edit(robotData, (err, githubResponse) ->
                res.redirect '/robots/update/' + robot.gist
            )
        )
    )

exports.fork = (req, res) ->

    gistId = req.params.robot_id
    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    Robot.find(where: gist: gistId).success((robot) ->
        if (robot.is_public and !(robot.user_id == req.user.id))
            github.gists.fork id: gistId, (err, githubResponse) ->
                robotFork = Robot.build(
                    ownerLogin: req.user.login,
                    gist: githubResponse.id,
                    isPublic: githubResponse.public,
                    title: githubResponse.description
                )
                req.user.addRobot(robotFork).success ->
                    res.redirect '/robots/update/' + robotFork.gist
        else
            res.redirect '/'
    )
