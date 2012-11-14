/*
 * GET users listing.
 */

var path = require('path'),
    sequelize = require(path.join(process.env.CWD, 'fightcode', 'config', 'database')),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    User = sequelize.import(path.join(modelsPath, 'user'));

exports.list = function(req, res){
    res.send("respond with a resource");
};

exports.show = function(req, res) {
    var userLogin = req.params[0];
    console.log(req);
    User.find({where: { login: userLogin}})
        .success(function(user){
            return res.render('user', {
                title: user.name,
                user: user
            });
        });
};