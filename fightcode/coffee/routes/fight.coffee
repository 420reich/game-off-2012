exports.startFight = (req, res) ->
    return res.redirect '/auth/github' if !req.loggedIn

    myRobot = req.params[1]
    otherRobotId = req.params[2]

    res.render 'fightRobot', title: 'Fight Another Robot'

