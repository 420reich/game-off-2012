
/*
 * GET home page.
 */

var everyauth = require('everyauth');

exports.index = function(req, res){
    if (req.session.auth == null || req.session.auth.github.user == null) {
        res.redirect('/auth/github');
    } else {
        res.render('index');
    }
};
