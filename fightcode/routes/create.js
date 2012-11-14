/*
 * GET home page.
 */

exports.create = function(req, res){
    if (!req.loggedIn) {
        res.redirect('/auth/github?redirectUrl=/robots/create');
    } else {
        res.render('createRobot', {
            title: 'Create My Robot!'
        });
    }
}
