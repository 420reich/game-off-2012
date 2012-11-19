path = require('path')
basePath = path.join(process.env.CWD, 'fightcode')

sequelize = require path.join(basePath, 'config', 'database')

Robot = sequelize.import(path.join(basePath, 'models', 'robot'))
GithubApi = require 'github'


exports.createView = (req, res) ->
    res.render 'createRobot', title: 'Create My Robot!', 'roboCode': '', robotTitle: ''


exports.create = (req, res) ->

    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    robotData =
        description: req.param('title'),
        public: 'true',
        files:
            'robot.js':
                'content': req.param('code')

    github.gists.create robotData, (err, githubResponse) ->
        Robot.create(
            ownerLogin: req.user.login,
            gists: githubResponse.id,
            isPublic: true,
            title: req.param('title')
        ).success((robot) ->
            res.redirect '/robots/update/' + robot.gists
        )


exports.updateView = (req, res) ->

    gistsId = req.params[0]
    github = new GithubApi version: '3.0.0'
    github.authenticate type: 'oauth', token: req.user.token

    Robot.find(where: gists: gistsId).success (robot) ->
        if !robot
            Robot.create(
                ownerLogin: req.user.login,
                gists: gistsId,
                isPublic: true,
                title: 'No title'
            ).success((robot) ->
                github.gists.get id: gistsId, (err, githubResponse) ->
                    files = Object.keys githubResponse.files
                    res.render('createRobot',
                        title: 'Update my robot',
                        roboCode: encodeURI(githubResponse.files[files[0]].content),
                        robotTitle: robot.title
                    )
            )
        else
            github.gists.get id: gistsId, (err, githubResponse) ->
                    files = Object.keys githubResponse.files
                    res.render('createRobot',
                        title: 'Update my robot',
                        roboCode: encodeURI(githubResponse.files[files[0]].content),
                        robotTitle: robot.title
                    )


exports.update = (req, res) ->
