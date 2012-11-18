
exports.startFight = function(req, res) {
  var myRobot, otherRobotId;
  if (!req.loggedIn) {
    return res.redirect('/auth/github');
  }
  myRobot = req.params[1];
  otherRobotId = req.params[2];
  return res.render('fightRobot', {
    title: 'Fight Another Robot'
  });
};
