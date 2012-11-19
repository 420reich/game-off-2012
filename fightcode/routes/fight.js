
exports.startFight = function(req, res) {
  var myRobot, otherRobotId;
  myRobot = req.params[1];
  otherRobotId = req.params[2];
  return res.render('fightRobot', {
    title: 'Fight Another Robot'
  });
};
