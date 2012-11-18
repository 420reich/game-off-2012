
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('ranking', {
        title: 'The Amazing Robot League'
    });
};
